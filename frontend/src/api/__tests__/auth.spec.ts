import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  accessToken,
  isAuthenticated,
  getUserQuery,
  loginMutation,
  signupMutation,
  logoutMutation,
  refreshToken,
  initAuth,
} from '../auth';
import { apiClient, authClient } from '../client';
import MockAdapter from 'axios-mock-adapter';
import { createPinia, setActivePinia } from 'pinia';
import { useQueryCache } from '@pinia/colada';

vi.mock('@pinia/colada', () => ({
  defineQueryOptions: (fn: any) => fn,
  defineMutation: (fn: any) => fn,
  useQueryCache: vi.fn(),
}));

describe('auth api', () => {
  let mockApi: MockAdapter;
  let mockAuth: MockAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = new MockAdapter(apiClient);
    mockAuth = new MockAdapter(authClient);
    accessToken.value = null;
    console.error = vi.fn();
    console.debug = vi.fn();
    vi.mocked(useQueryCache).mockReturnValue({
      invalidateQueries: vi.fn(),
      setQueryData: vi.fn(),
    } as any);
  });

  afterEach(() => {
    mockApi.restore();
    mockAuth.restore();
    vi.clearAllMocks();
  });

  it('isAuthenticated is true when accessToken has a value', () => {
    expect(isAuthenticated.value).toBe(false);
    accessToken.value = 'token';
    expect(isAuthenticated.value).toBe(true);
  });

  it('getUserQuery returns expected user', async () => {
    const user = { user_id: '1', email: 'test@example.com', is_active: true };
    mockApi.onGet('/user').reply(200, user);

    const query = getUserQuery();
    // @ts-ignore
    const result = await query.query();
    expect(result).toEqual(user);
  });

  describe('loginMutation', () => {
    it('sets accessToken and invalidates queries on success', async () => {
      const loginInfo = { access_token: 'new-token', token_type: 'bearer' };
      mockApi.onPost('/auth/login').reply(200, loginInfo);

      const mutationConfig = loginMutation();
      const params = new URLSearchParams();
      // @ts-ignore
      const data = await mutationConfig.mutation(params);
      expect(data).toEqual(loginInfo);

      // simulate onSuccess
      const cache = useQueryCache();
      // @ts-ignore
      mutationConfig.onSuccess(data);

      expect(accessToken.value).toBe('new-token');
      expect(cache.invalidateQueries).toHaveBeenCalled();
    });

    it('logs error on error', () => {
      const mutationConfig = loginMutation();
      // @ts-ignore
      mutationConfig.onError();
      expect(console.error).toHaveBeenCalledWith('Login failed');
    });
  });

  describe('signupMutation', () => {
    it('returns user data on success', async () => {
      const payload = { email: 'test@example.com', username: 'test', password: 'password' };
      const user = { user_id: '1', email: 'test@example.com', is_active: true };
      mockApi.onPost('/auth/signup').reply(200, user);

      const mutationConfig = signupMutation();
      // @ts-ignore
      const result = await mutationConfig.mutation(payload);
      expect(result).toEqual(user);
    });

    it('logs messages on success and error', () => {
      const mutationConfig = signupMutation();
      // @ts-ignore
      mutationConfig.onSuccess();
      expect(console.debug).toHaveBeenCalledWith('SignUp successful');

      const error = new Error('fail');
      // @ts-ignore
      mutationConfig.onError(error);
      expect(console.error).toHaveBeenCalledWith('SignUp failed: ', error);
    });
  });

  describe('logoutMutation', () => {
    it('clears accessToken and invalidates user query on success', async () => {
      accessToken.value = 'token';
      mockApi.onPost('/auth/logout').reply(200);

      const mutationConfig = logoutMutation();
      // @ts-ignore
      await mutationConfig.mutation();

      const cache = useQueryCache();

      // @ts-ignore
      mutationConfig.onSuccess();
      expect(accessToken.value).toBeNull();

      // @ts-ignore
      mutationConfig.onSettled();
      expect(cache.invalidateQueries).toHaveBeenCalled();
    });

    it('clears accessToken and logs error on error', () => {
      accessToken.value = 'token';
      const mutationConfig = logoutMutation();
      const error = new Error('fail');

      // @ts-ignore
      mutationConfig.onError(error);
      expect(console.error).toHaveBeenCalledWith('Logout failed: ', error);
      expect(accessToken.value).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('fetches a new token and sets accessToken', async () => {
      const loginInfo = { access_token: 'refresh-token', token_type: 'bearer' };
      mockAuth.onPost('/auth/refresh').reply(200, loginInfo);

      const token = await refreshToken();
      expect(token).toBe('refresh-token');
      expect(accessToken.value).toBe('refresh-token');
    });

    it('returns the same promise if called concurrently', async () => {
      mockAuth.onPost('/auth/refresh').reply((config) => {
        return new Promise((resolve) =>
          setTimeout(() => resolve([200, { access_token: 'refresh-token' }]), 50),
        );
      });

      const [token1, token2] = await Promise.all([refreshToken(), refreshToken()]);
      expect(token1).toBe('refresh-token');
      expect(token2).toBe('refresh-token');
      expect(mockAuth.history.post.length).toBe(1);
    });

    it('returns empty string if accessToken is null after refresh', async () => {
      // @ts-ignore
      mockAuth.onPost('/auth/refresh').reply(200, { access_token: null });
      const result = await refreshToken();
      expect(result).toBe('');
    });
  });

  describe('initAuth', () => {
    it('fetches refresh token and sets accessToken', async () => {
      const loginInfo = { access_token: 'init-token', token_type: 'bearer' };
      mockAuth.onPost('/auth/refresh').reply(200, loginInfo);

      await initAuth();
      expect(accessToken.value).toBe('init-token');
    });

    it('sets accessToken to null if refresh fails', async () => {
      accessToken.value = 'some-token';
      mockAuth.onPost('/auth/refresh').reply(401);

      await initAuth();
      expect(accessToken.value).toBeNull();
    });
  });
});
