import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isAuthenticated,
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
    isAuthenticated.value = false;
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

  it('isAuthenticated is false initially', () => {
    expect(isAuthenticated.value).toBe(false);
  });

  describe('loginMutation', () => {
    it('posts credentials and returns token data', async () => {
      mockApi.onPost('/auth/login').reply(200);

      const config = loginMutation() as any;
      const data = await config.mutation(new URLSearchParams());
      expect(data).toBeUndefined();
    });

    it('sets isAuthenticated, shows toast, and redirects to weeks on success', async () => {
      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
      const cache = useQueryCache();

      const config = loginMutation() as any;
      await config.onSuccess();

      expect(isAuthenticated.value).toBe(true);
      expect(cache.invalidateQueries).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully!');
      expect(pushMock).toHaveBeenCalledWith({ name: ROUTE_NAMES.WEEKS });
    });
  });

  describe('signupMutation', () => {
    it('posts registration payload and returns token data', async () => {
      const payload = { email: 'test@example.com', username: 'test', password: 'password' };
      mockApi.onPost('/auth/signup').reply(201);

      const config = signupMutation() as any;
      const result = await config.mutation(payload);
      expect(result).toBeUndefined();
    });

    it('sets isAuthenticated, shows toast, and redirects to weeks on success', async () => {
      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);

      const config = signupMutation() as any;
      await config.onSuccess();

      expect(isAuthenticated.value).toBe(true);
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

    it('clears isAuthenticated on settled', () => {
      isAuthenticated.value = true;
      const config = logoutMutation() as any;
      config.onSettled();
      expect(isAuthenticated.value).toBe(false);
    });

    it('invalidates user query on settled', () => {
      const cache = useQueryCache();
      const config = logoutMutation() as any;
      config.onSettled();
      expect(cache.invalidateQueries).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('fetches a new token and sets isAuthenticated', async () => {
      mockAuth.onPost('/auth/refresh').reply(200);

      await refreshToken();
      expect(isAuthenticated.value).toBe(true);
    });

    it('returns the same promise if called concurrently', async () => {
      mockAuth
        .onPost('/auth/refresh')
        .reply(() => new Promise((resolve) => setTimeout(() => resolve([200]), 50)));

      await Promise.all([refreshToken(), refreshToken()]);
      expect(isAuthenticated.value).toBe(true);
      expect(mockAuth.history.post.length).toBe(1);
    });
  });

  describe('initAuth', () => {
    it('sets isAuthenticated when refresh succeeds', async () => {
      mockAuth.onPost('/auth/refresh').reply(200);

      await initAuth();
      expect(isAuthenticated.value).toBe(true);
    });

    it('sets isAuthenticated to false when refresh fails', async () => {
      isAuthenticated.value = true;
      mockAuth.onPost('/auth/refresh').reply(401);

      await expect(initAuth()).rejects.toThrow();
      expect(isAuthenticated.value).toBe(false);
    });
  });

  describe('googleAuthMutation', () => {
    it('sends code to exchange endpoint and returns token data', async () => {
      mockApi.onPost('/auth/google/exchange', { code: 'auth-code' }).reply(200);

      const config = googleAuthMutation() as any;
      const result = await config.mutation('auth-code');
      expect(result).toBeUndefined();
    });

    it('sets isAuthenticated, shows toast, and redirects to weeks on success', () => {
      const pushMock = vi.fn();
      vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);

      const config = googleAuthMutation() as any;
      config.onSuccess();

      expect(isAuthenticated.value).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully!');
      expect(pushMock).toHaveBeenCalledWith({ name: ROUTE_NAMES.WEEKS });
    });

    it('returns an error when the exchange endpoint fails', async () => {
      mockApi
        .onPost('/auth/google/exchange')
        .reply(400, { detail: 'Invalid or expired authorization code' });

      const config = googleAuthMutation() as any;
      await expect(config.mutation('bad-code')).rejects.toThrow();
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
