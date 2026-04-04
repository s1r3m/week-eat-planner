import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, authClient, getErrorMessage, AUTH_EXCLUDED_PATHS } from '../client';
import { useAuthStore } from '@/features/auth/store/auth';
import { createPinia, setActivePinia } from 'pinia';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

vi.mock('@/features/auth/store/auth', () => ({
  useAuthStore: vi.fn(),
}));

describe('apiClient', () => {
  let mockApi: MockAdapter;
  let mockAuth: MockAdapter;
  let authStore: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = new MockAdapter(apiClient);
    mockAuth = new MockAdapter(authClient);
    authStore = {
      accessToken: 'old-token',
      setAccessToken: vi.fn((token) => {
        authStore.accessToken = token;
      }),
      logout: vi.fn().mockResolvedValue(undefined),
    };
    (useAuthStore as any).mockReturnValue(authStore);
  });

  afterEach(() => {
    mockApi.restore();
    mockAuth.restore();
    vi.clearAllMocks();
  });

  describe('request interceptor', () => {
    it('should add Authorization header if accessToken exists', async () => {
      mockApi.onGet('/test').reply(200, { success: true });
      const response = await apiClient.get('/test');
      expect(response.config.headers?.Authorization).toBe('Bearer old-token');
    });

    it('should not add Authorization header if accessToken does not exist', async () => {
      authStore.accessToken = null;
      mockApi.onGet('/test').reply(200, { success: true });
      const response = await apiClient.get('/test');
      expect(response.config.headers?.Authorization).toBeUndefined();
    });
  });

  describe('getErrorMessage', () => {
    it('should return "Unexpected error" for non-axios errors', () => {
      expect(getErrorMessage(new Error('test'))).toBe('Unexpected error');
    });

    it('should return detail from response data', () => {
      const error = {
        isAxiosError: true,
        response: { data: { detail: 'Specific error' } },
      };
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      expect(getErrorMessage(error)).toBe('Specific error');
    });

    it('should return error message if detail is missing', () => {
      const error = {
        isAxiosError: true,
        message: 'Network Error',
      };
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      expect(getErrorMessage(error)).toBe('Network Error');
    });

    it('should return "Request Failed" as fallback', () => {
      const error = { isAxiosError: true };
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      expect(getErrorMessage(error)).toBe('Request Failed');
    });
  });

  describe('response interceptor (refresh logic)', () => {
    it('should reject non-axios errors', async () => {
      mockApi.onGet('/test').reply(() => Promise.reject(new Error('not axios')));
      await expect(apiClient.get('/test')).rejects.toThrow('not axios');
    });

    it('should reject if status is 401 but path is excluded', async () => {
      const path = AUTH_EXCLUDED_PATHS[0];
      mockApi.onGet(path).reply(401);
      await expect(apiClient.get(path)).rejects.toThrow();
    });

    it('should refresh token on 401 and retry original request', async () => {
      mockApi.onGet('/test').replyOnce(401).onGet('/test').reply(200, { data: 'ok' });
      mockAuth.onPost('/auth/refresh').reply(200, { accessToken: 'new-token' });

      const response = await apiClient.get('/test');

      expect(response.data).toEqual({ data: 'ok' });
      expect(authStore.setAccessToken).toHaveBeenCalledWith('new-token');
      expect(response.config.headers?.Authorization).toBe('Bearer new-token');
    });

    it('should queue multiple 401 requests and resolve them after refresh', async () => {
      mockApi.onGet('/test1').replyOnce(401).onGet('/test1').reply(200, { data: 'ok1' });
      mockApi.onGet('/test2').replyOnce(401).onGet('/test2').reply(200, { data: 'ok2' });

      // Delay refresh to ensure queueing
      mockAuth.onPost('/auth/refresh').reply(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return [200, { accessToken: 'new-token' }];
      });

      const [res1, res2] = await Promise.all([apiClient.get('/test1'), apiClient.get('/test2')]);

      expect(res1.data).toEqual({ data: 'ok1' });
      expect(res2.data).toEqual({ data: 'ok2' });
      expect(mockAuth.history.post.length).toBe(1);
    });

    it('should reject if newToken is null in queued request', async () => {
      mockApi.onGet('/test1').replyOnce(401);

      mockAuth.onPost('/auth/refresh').reply(200, { accessToken: null });

      await expect(apiClient.get('/test1')).rejects.toThrow();
    });

    it('should handle refresh failure, logout and clear token', async () => {
      mockApi.onGet('/test').reply(401);
      mockAuth.onPost('/auth/refresh').reply(401, { detail: 'Refresh failed' });
      mockAuth.onPost('/auth/logout').reply(200);

      await expect(apiClient.get('/test')).rejects.toThrow();
      expect(authStore.setAccessToken).toHaveBeenCalledWith(null);
    });

    it('should handle logout failure gracefully during refresh failure', async () => {
      mockApi.onGet('/test').reply(401);
      mockAuth.onPost('/auth/refresh').reply(401, { detail: 'Refresh failed' });
      mockAuth.onPost('/auth/logout').reply(500);

      await expect(apiClient.get('/test')).rejects.toThrow();
      expect(authStore.setAccessToken).toHaveBeenCalledWith(null);
    });

    it('should reject non-axios errors in response interceptor with custom check', async () => {
      vi.spyOn(axios, 'isAxiosError').mockReturnValueOnce(false);
      mockApi.onGet('/test').reply(() => Promise.reject(new Error('plain error')));
      await expect(apiClient.get('/test')).rejects.toThrow('plain error');
    });
  });
});
