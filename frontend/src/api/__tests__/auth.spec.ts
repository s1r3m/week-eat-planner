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
  googleAuthMutation,
} from '../auth';
import { apiClient, authClient } from '../client';
import MockAdapter from 'axios-mock-adapter';
import { createPinia, setActivePinia } from 'pinia';
import { useQueryCache } from '@pinia/colada';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

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
    vi.restoreAllMocks();
  });

  it('isAuthenticated is true when accessToken has a value', () => {
    expect(isAuthenticated.value).toBe(false);
    accessToken.value = 'token';
    expect(isAuthenticated.value).toBe(true);
  });

  it('getUserQuery fetches and returns the current user', async () => {
    const user = { user_id: '1', email: 'test@example.com', is_active: true };
    mockApi.onGet('/user').reply(200, user);

    const query = getUserQuery() as any;
    const result = await query.query();
    expect(result).toEqual(user);
  });

  describe('loginMutation', () => {
    it('posts credentials and returns token data', async () => {
      const loginInfo = { access_token: 'new-token', token_type: 'bearer' };
      mockApi.onPost('/auth/login').reply(200, loginInfo);

      const config = loginMutation() as any;
      const data = await config.mutation(new URLSearchParams());
      expect(data).toEqual(loginInfo);
    });

    it('sets accessToken, shows toast, and redirects to weeks on success', async () => {
      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
      const cache = useQueryCache();

      const config = loginMutation() as any;
      const loginInfo = { access_token: 'new-token', token_type: 'bearer' };
      await config.onSuccess(loginInfo);

      expect(accessToken.value).toBe('new-token');
      expect(cache.invalidateQueries).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully!');
      expect(pushMock).toHaveBeenCalledWith({ name: ROUTE_NAMES.WEEKS });
    });
  });

  describe('signupMutation', () => {
    it('posts registration payload and returns token data', async () => {
      const payload = { email: 'test@example.com', username: 'test', password: 'password' };
      const loginInfo = { access_token: 'new-token', token_type: 'bearer' };
      mockApi.onPost('/auth/signup').reply(201, loginInfo);

      const config = signupMutation() as any;
      const result = await config.mutation(payload);
      expect(result).toEqual(loginInfo);
    });

    it('sets accessToken, shows toast, and redirects to weeks on success', async () => {
      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);

      const config = signupMutation() as any;
      const loginInfo = { access_token: 'new-token', token_type: 'bearer' };
      await config.onSuccess(loginInfo);

      expect(accessToken.value).toBe('new-token');
      expect(toast.success).toHaveBeenCalledWith('Registration complete!');
      expect(pushMock).toHaveBeenCalledWith({ name: ROUTE_NAMES.WEEKS });
    });
  });

  describe('logoutMutation', () => {
    it('posts to logout endpoint', async () => {
      mockApi.onPost('/auth/logout').reply(200);

      const config = logoutMutation() as any;
      await config.mutation();

      expect(mockApi.history.post.length).toBe(1);
    });

    it('clears accessToken on success', () => {
      accessToken.value = 'token';
      const config = logoutMutation() as any;
      config.onSuccess();
      expect(accessToken.value).toBeNull();
    });

    it('clears accessToken on error', () => {
      accessToken.value = 'token';
      const config = logoutMutation() as any;
      config.onError(new Error('fail'));
      expect(accessToken.value).toBeNull();
    });

    it('invalidates user query on settled', () => {
      const cache = useQueryCache();
      const config = logoutMutation() as any;
      config.onSettled();
      expect(cache.invalidateQueries).toHaveBeenCalled();
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
      mockAuth
        .onPost('/auth/refresh')
        .reply(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve([200, { access_token: 'refresh-token' }]), 50),
            ),
        );

      const [token1, token2] = await Promise.all([refreshToken(), refreshToken()]);
      expect(token1).toBe('refresh-token');
      expect(token2).toBe('refresh-token');
      expect(mockAuth.history.post.length).toBe(1);
    });
  });

  describe('initAuth', () => {
    it('sets accessToken when refresh succeeds', async () => {
      mockAuth
        .onPost('/auth/refresh')
        .reply(200, { access_token: 'init-token', token_type: 'bearer' });

      await initAuth();
      expect(accessToken.value).toBe('init-token');
    });

    it('sets accessToken to null when refresh fails', async () => {
      accessToken.value = 'some-token';
      mockAuth.onPost('/auth/refresh').reply(401);

      await initAuth();
      expect(accessToken.value).toBeNull();
    });
  });

  describe('googleAuthMutation', () => {
    it('sends code to exchange endpoint and returns token data', async () => {
      const loginInfo = { access_token: 'google-token', token_type: 'bearer' };
      mockApi.onPost('/auth/google/exchange', { code: 'auth-code' }).reply(200, loginInfo);

      const config = googleAuthMutation() as any;
      const result = await config.mutation('auth-code');
      expect(result).toEqual(loginInfo);
    });

    it('sets accessToken and redirects to weeks on success', () => {
      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);

      const config = googleAuthMutation() as any;
      config.onSuccess({ access_token: 'google-token', token_type: 'bearer' });

      expect(accessToken.value).toBe('google-token');
      expect(pushMock).toHaveBeenCalledWith({ name: ROUTE_NAMES.WEEKS });
    });

    it('shows error toast on failure', () => {
      const config = googleAuthMutation() as any;
      config.onError(new Error('OAuth failed'));

      expect((toast as any).error).toHaveBeenCalledWith('Request failed: OAuth failed');
    });

    it('invalidates user query on settled', () => {
      const cache = useQueryCache();
      const config = googleAuthMutation() as any;
      config.onSettled();

      expect(cache.invalidateQueries).toHaveBeenCalled();
    });
  });
});
