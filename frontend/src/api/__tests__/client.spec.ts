import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, authClient, AUTH_EXCLUDED_PATHS } from '../client';
import { accessToken, refreshToken } from '../auth';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

vi.mock('../auth', () => ({
  accessToken: { value: null },
  refreshToken: vi.fn(),
}));

describe('apiClient', () => {
  let mockApi: MockAdapter;
  let mockAuth: MockAdapter;

  beforeEach(() => {
    mockApi = new MockAdapter(apiClient);
    mockAuth = new MockAdapter(authClient);
    accessToken.value = 'old-token';
    vi.mocked(refreshToken).mockResolvedValue('new-token');
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
      accessToken.value = null;
      mockApi.onGet('/test').reply(200, { success: true });
      const response = await apiClient.get('/test');
      expect(response.config.headers?.Authorization).toBeUndefined();
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

    it('should proceed to refresh if URL is empty', async () => {
      mockApi.onGet('').replyOnce(401).onGet('').reply(200, { data: 'ok' });
      vi.mocked(refreshToken).mockResolvedValue('new-token');

      const response = await apiClient.get('');

      expect(response.data).toEqual({ data: 'ok' });
      expect(refreshToken).toHaveBeenCalled();
    });

    it('should handle URL without leading slash in isAuthExcluded', async () => {
      // auth/login (without leading slash) should be excluded after it's transformed to /auth/login
      const path = 'auth/login';
      mockApi.onGet('/api/' + path).reply(401);

      await expect(apiClient.get(path)).rejects.toThrow();
      expect(refreshToken).not.toHaveBeenCalled();
    });

    it('should refresh token on 401 and retry original request', async () => {
      mockApi.onGet('/test').replyOnce(401).onGet('/test').reply(200, { data: 'ok' });
      vi.mocked(refreshToken).mockResolvedValue('new-token');

      const response = await apiClient.get('/test');

      expect(response.data).toEqual({ data: 'ok' });
      expect(refreshToken).toHaveBeenCalled();
      expect(response.config.headers?.Authorization).toBe('Bearer new-token');
    });

    it('should queue multiple 401 requests and resolve them after refresh', async () => {
      mockApi.onGet('/test1').replyOnce(401).onGet('/test1').reply(200, { data: 'ok1' });
      mockApi.onGet('/test2').replyOnce(401).onGet('/test2').reply(200, { data: 'ok2' });

      // Create a single shared promise to simulate the coalescing logic
      let sharedPromise: Promise<string> | null = null;
      const underlyingRefresh = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return 'new-token';
      });

      vi.mocked(refreshToken).mockImplementation(() => {
        if (!sharedPromise) {
          sharedPromise = underlyingRefresh();
        }
        return sharedPromise as Promise<string>;
      });

      const [res1, res2] = await Promise.all([apiClient.get('/test1'), apiClient.get('/test2')]);

      expect(res1.data).toEqual({ data: 'ok1' });
      expect(res2.data).toEqual({ data: 'ok2' });
      expect(refreshToken).toHaveBeenCalledTimes(2);
      expect(underlyingRefresh).toHaveBeenCalledTimes(1);
    });

    it('should reject if newToken is null from refreshToken', async () => {
      mockApi.onGet('/test1').replyOnce(401);

      vi.mocked(refreshToken).mockResolvedValue(''); // Or we can change test to resolve to empty string since it returns string

      await expect(apiClient.get('/test1')).rejects.toThrow();
    });

    it('should handle missing headers in originalConfig', async () => {
      mockApi
        .onGet('/test-no-headers')
        .replyOnce((config) => {
          // Force headers to be undefined on the config that gets rejected
          config.headers = undefined as any;
          return [401];
        })
        .onGet('/test-no-headers')
        .reply(200, { data: 'ok' });

      vi.mocked(refreshToken).mockResolvedValue('new-token');

      const response = await apiClient.get('/test-no-headers');
      expect(response.config.headers?.Authorization).toBe('Bearer new-token');
    });

    it('should handle refresh failure and reject original request', async () => {
      mockApi.onGet('/test').reply(401);
      vi.mocked(refreshToken).mockRejectedValue(new Error('Refresh failed'));

      await expect(apiClient.get('/test')).rejects.toThrow('Refresh failed');
    });

    it('should reject non-axios errors in response interceptor with custom check', async () => {
      vi.spyOn(axios, 'isAxiosError').mockReturnValueOnce(false);
      mockApi.onGet('/test').reply(() => Promise.reject(new Error('plain error')));
      await expect(apiClient.get('/test')).rejects.toThrow('plain error');
    });
  });
});
