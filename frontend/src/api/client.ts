import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/features/auth/store/auth';

const DEFAULT_TIMEOUT = 5000;

interface ErrorResponse {
  detail: string;
}

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: DEFAULT_TIMEOUT,
});

export const authClient = axios.create({
  baseURL: '/api',
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
});

// Add Auth header.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const authStore = useAuthStore();
    if (authStore.accessToken && !config.headers.Authorization) {
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

    if (
      !originalConfig ||
      isAuthExcluded(originalConfig.url) ||
      error.response?.status !== 401 ||
      originalConfig._retry
    ) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    const authStore = useAuthStore();
    const newToken = await authStore.refreshToken();

    if (newToken) {
      originalConfig.headers = originalConfig.headers || {};
      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      return apiClient.request(originalConfig);
    }

    return Promise.reject(error);
  },
);
