import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Include cookies for refresh token
})

const refreshClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Include cookies for refresh token
})

apiClient.interceptors.request.use(
  (config) => {
    if (config.url === '/auth/refresh') {
      throw new axios.Cancel('Request to /auth/refresh is not allowed through apiClient')
    }

    const authStore = useAuthStore()
    console.log(`API Client ${config.url} - isAuthenticated: ${authStore.isAuthenticated}`)
    if (authStore.isAuthenticated) {
      config.headers.Authorization = `Bearer ${authStore.access_token}`
    }

    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, access_token: string | null = null) => {
  failedQueue.forEach((prom) => {
      if (error) {
          prom.reject(error)
      } else {
          prom.resolve(access_token)
      }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
      const originalRequest = error.config
      const authStore = useAuthStore()

      if (error.config.url === '/auth/login' || error.config.url === '/auth/signup') {
        return Promise.reject(error)
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
              return new Promise((resolve, reject) => {
                  failedQueue.push({ resolve, reject })
              })
              .then((access_token) => {
                  originalRequest.headers['Authorization'] = `Bearer ${access_token}`
                  return apiClient(originalRequest);                  
              })
              .catch((err: any) => Promise.reject(err))
          }
          
          originalRequest._retry = true
          isRefreshing = true
          
          try {
            const refreshResponse = await refreshClient.post('/auth/refresh')
            authStore.setToken(refreshResponse.data)

            const newAccessToken = refreshResponse.data.access_token
            processQueue(null, newAccessToken)

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return apiClient(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError, null)
            authStore.clearToken()
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
    }
    return Promise.reject(error)
  }
)

export default apiClient;
