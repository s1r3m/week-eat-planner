import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useClientIdStore } from '@/stores/clientId';
import type { UserLoginResponse } from '@/types/api';

const createApiClient = (baseUrl: string, withCredentials: boolean = false) =>
  axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: withCredentials,
  });

const apiClient = createApiClient('/api');
export const refreshClient = createApiClient('/api/auth', true); // Include cookies if available

// Add Auth header.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

// Store all incoming requests while refresh is attempting.
let isRefreshing = false;
let pendingRequests: ((newToken: string | null) => void)[] = [];

const resolveRequests = (newToken: string | null) => {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
};

// Handle 401 of the request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const authStore = useAuthStore();
    const clientIdStore = useClientIdStore();
    const originalRequest = error.config;
    if (
      !originalRequest ||
      originalRequest.url === '/auth/login' || // Don't try with other auth methods
      originalRequest.url === '/auth/signup' // Don't try with other auth methods
    ) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status === 401) {
      if (isRefreshing) {
        // Push the request to the queue and quit.
        return new Promise((resolve, reject) =>
          pendingRequests.push((newToken: string | null) => {
            if (!newToken) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          }),
        );
      }

      // Let's try to refresh the token and finally resolve all queued requests.
      isRefreshing = true;
      try {
        const refreshResponse = await refreshClient.post('/refresh', {
          client_id: clientIdStore.getClientId(),
        });
        if (refreshResponse.status == 200) {
          authStore.setToken(refreshResponse.data as UserLoginResponse);
        }
        throw new AxiosError('Refresh was 401. Stop the show. Go to login page.');
      } catch (refreshError: any) {
        authStore.clearToken();
      } finally {
        isRefreshing = false;
        resolveRequests(authStore.accessToken);
      }
    }

    // All non-401 errors should go further.
    return Promise.reject(error);
  },
);

export default apiClient;
