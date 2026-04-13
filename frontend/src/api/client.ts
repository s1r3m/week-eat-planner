import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { accessToken, refreshToken } from './auth';

/**
 * Default timeout for API requests in milliseconds.
 */
const DEFAULT_TIMEOUT = 5000;

/**
 * Axios instance for making authenticated API requests.
 * Automatically handles Bearer token attachment and 401 token refresh.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: DEFAULT_TIMEOUT,
});

/**
 * Axios instance for authentication-related requests.
 * Configured with `withCredentials: true` to handle session cookies.
 */
export const authClient = axios.create({
  baseURL: '/api',
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
});

// Add Auth header.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (accessToken.value && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken.value}`;
    }
    return config;
  },
);

// Error handling helpers
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

    try {
      const newToken = await refreshToken();
      if (!newToken.trim()) throw new Error('Refresh returned empty token');
      originalConfig.headers = originalConfig.headers || {};
      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      return apiClient.request(originalConfig);
    } catch (err: unknown) {
      accessToken.value = null;
      return Promise.reject(err);
    }
  },
);
