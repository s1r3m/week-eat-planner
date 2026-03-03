import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/features/auth/store/auth';
import type { AccessToken, ErrorResponse } from '@/app/api/types';

const DEFAULT_TIMEOUT = 5000;

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authClient = axios.create({
  baseURL: '/api',
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add Auth header.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
);

// Error handling helpers
export const getErrorMessage = (err: unknown): string => {
  if (!axios.isAxiosError(err)) {
    return 'Unexpected error';
  }

  const data = err.response?.data as ErrorResponse | undefined;
  return data?.detail || err.message || 'Request Failed';
};

// Refresh functionality
let isRefreshing = false;
let pendingRequests: ((newToken: string | null) => void)[] = [];

const resolveRequests = (newToken: string | null) => {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
};

export const AUTH_EXCLUDED_PATHS = ['/auth/login', '/auth/refresh', '/auth/signup', '/auth/logout'];

const isAuthExcluded = (url: string | undefined): boolean => {
  if (!url) {
    return false;
  }

  const path = url.startsWith('/') ? url : `/${url}`;
  return AUTH_EXCLUDED_PATHS.includes(path);
};

// Handle 401 responses and try to refresh the token.
apiClient.interceptors.response.use(
  (response) => response,
  async (err: unknown) => {
    if (!axios.isAxiosError(err)) {
      return Promise.reject(err);
    }

    const error = err as AxiosError;
    const originalConfig = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!originalConfig || isAuthExcluded(originalConfig.url)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status !== 401 || originalConfig._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Push the request to the queue and quit.
      return new Promise((resolve, reject) =>
        pendingRequests.push((newToken: string | null) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalConfig.headers = originalConfig.headers || {};
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          originalConfig._retry = true;
          resolve(apiClient.request(originalConfig));
        }),
      );
    }

    originalConfig._retry = true;
    isRefreshing = true;
    const authStore = useAuthStore();
    try {
      const res = await authClient.post<AccessToken>('auth/refresh');
      const newToken = res.data.access_token;
      authStore.setAccessToken(newToken);
      originalConfig.headers = originalConfig.headers || {};
      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      return apiClient.request(originalConfig);
    } catch (refreshError: unknown) {
      console.log('Refresh token failed: ', getErrorMessage(refreshError));
      try {
        await authClient.post('/auth/logout');
      } catch (logoutError: unknown) {
        console.error('Logout failed: ', getErrorMessage(logoutError));
      } finally {
        authStore.setAccessToken(null);
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
      resolveRequests(authStore.accessToken);
    }
  },
);
