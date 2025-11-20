import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useClientIdStore } from '@/stores/clientId';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for refresh token
});

const refreshClient = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for refresh token
});

apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated && authStore.access_token) {
      config.headers.Authorization = `Bearer ${authStore.access_token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, access_token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(access_token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();
    const clientIdStore = useClientIdStore();

    if (error?.config?.url === '/auth/login' || error.config?.url === '/auth/signup') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((access_token) => {
            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
            return apiClient(originalRequest);
          })
          .catch((err: any) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await refreshClient.post('/auth/refresh', {
          client_id: clientIdStore.getClientId(),
        });
        authStore.setToken(refreshResponse.data);

        const newAccessToken = refreshResponse.data.access_token;
        processQueue(null, newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStore.clearToken();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// Small helper used by the router to attempt a silent refresh when a user
// navigates to a protected route and the access token is missing but a
// refresh token cookie may still be present.
export async function attemptRefresh(client_id: string) {
  const refreshResponse = await refreshClient.post('/auth/refresh', {
    client_id,
  });
  return refreshResponse.data;
}

export default apiClient;
