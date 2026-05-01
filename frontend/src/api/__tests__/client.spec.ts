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
    it('adds Authorization header when accessToken is set', async () => {
      mockApi.onGet('/test').reply(200, { success: true });
      const response = await apiClient.get('/test');
      expect(response.config.headers?.Authorization).toBe('Bearer old-token');
    });

    it('omits Authorization header when accessToken is null', async () => {
      accessToken.value = null;
      mockApi.onGet('/test').reply(200, { success: true });
      const response = await apiClient.get('/test');
      expect(response.config.headers?.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('rejects non-axios errors immediately', async () => {
      mockApi.onGet('/test').reply(() => Promise.reject(new Error('not axios')));
      await expect(apiClient.get('/test')).rejects.toThrow('not axios');
    });

    it('rejects 401 on excluded paths without refreshing', async () => {
      const path = AUTH_EXCLUDED_PATHS[0];
      mockApi.onGet(path).reply(401);
      await expect(apiClient.get(path)).rejects.toThrow();
    });

    it('rejects paths without leading slash that match excluded paths', async () => {
      const path = 'auth/login';
      mockApi.onGet('/api/' + path).reply(401);
      await expect(apiClient.get(path)).rejects.toThrow();
      expect(refreshToken).not.toHaveBeenCalled();
    });

    it('refreshes token and retries when URL is empty', async () => {
      mockApi.onGet('').replyOnce(401).onGet('').reply(200, { data: 'ok' });

      const response = await apiClient.get('');

      expect(response.data).toEqual({ data: 'ok' });
      expect(refreshToken).toHaveBeenCalled();
    });

    it('refreshes token on 401 and retries original request with new token', async () => {
      mockApi.onGet('/test').replyOnce(401).onGet('/test').reply(200, { data: 'ok' });

      const response = await apiClient.get('/test');

      expect(response.data).toEqual({ data: 'ok' });
      expect(refreshToken).toHaveBeenCalled();
      expect(response.config.headers?.Authorization).toBe('Bearer new-token');
    });

    it('coalesces concurrent 401s into a single refresh call', async () => {
      mockApi.onGet('/test1').replyOnce(401).onGet('/test1').reply(200, { data: 'ok1' });
      mockApi.onGet('/test2').replyOnce(401).onGet('/test2').reply(200, { data: 'ok2' });

      let sharedPromise: Promise<string> | null = null;
      const underlyingRefresh = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return 'new-token';
      });

      vi.mocked(refreshToken).mockImplementation(() => {
        if (!sharedPromise) sharedPromise = underlyingRefresh();
        return sharedPromise as Promise<string>;
      });

      const [res1, res2] = await Promise.all([apiClient.get('/test1'), apiClient.get('/test2')]);

      expect(res1.data).toEqual({ data: 'ok1' });
      expect(res2.data).toEqual({ data: 'ok2' });
      expect(refreshToken).toHaveBeenCalledTimes(2);
      expect(underlyingRefresh).toHaveBeenCalledTimes(1);
    });

    it('rejects when refresh returns an empty token', async () => {
      mockApi.onGet('/test1').replyOnce(401);
      vi.mocked(refreshToken).mockResolvedValue('');
      await expect(apiClient.get('/test1')).rejects.toThrow();
    });

    it('sets Authorization header even when original config had no headers', async () => {
      mockApi
        .onGet('/test-no-headers')
        .replyOnce((config) => {
          config.headers = undefined as any;
          return [401];
        })
        .onGet('/test-no-headers')
        .reply(200, { data: 'ok' });

      const response = await apiClient.get('/test-no-headers');
      expect(response.config.headers?.Authorization).toBe('Bearer new-token');
    });

    it('rejects when refresh itself fails', async () => {
      mockApi.onGet('/test').reply(401);
      vi.mocked(refreshToken).mockRejectedValue(new Error('Refresh failed'));
      await expect(apiClient.get('/test')).rejects.toThrow('Refresh failed');
    });

    it('rejects non-axios errors detected via isAxiosError check', async () => {
      vi.spyOn(axios, 'isAxiosError').mockReturnValueOnce(false);
      mockApi.onGet('/test').reply(() => Promise.reject(new Error('plain error')));
      await expect(apiClient.get('/test')).rejects.toThrow('plain error');
    });
  });
});
