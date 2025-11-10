import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    if (authStore.isAuthenticated) {
      config.headers.Authorization = `Bearer ${authStore.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response) {
            return Promise.reject(error.response)
        } else if (error.request) {
            return Promise.reject(error.request)
        }
        return Promise.reject(error)
    }
)

export default apiClient;
