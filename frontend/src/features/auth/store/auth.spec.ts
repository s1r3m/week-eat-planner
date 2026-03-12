import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { apiClient, authClient } from '@/api/client';
import MockAdapter from 'axios-mock-adapter';
import type { UserInfo } from '@/domain/auth/models';
import { useAuthStore } from './auth';

describe('auth store', () => {
  let mockApiClient: MockAdapter;
  let mockAuthClient: MockAdapter;

  const mockUser: UserInfo = {
    user_id: 'test-user-id',
    email: 'test@example.com',
    username: 'username-test',
    is_active: true,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiClient = new MockAdapter(apiClient);
    mockAuthClient = new MockAdapter(authClient);
  });

  afterEach(() => {
    mockApiClient.restore();
    mockAuthClient.restore();
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const store = useAuthStore();
    expect(store.accessToken).toBe(null);
    expect(store.user).toBe(null);
    expect(store.isInitialized).toBe(false);
  });

  it('should set access token', () => {
    const store = useAuthStore();
    store.setAccessToken('test-token');
    expect(store.accessToken).toBe('test-token');
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const store = useAuthStore();
      const mockToken = 'new-access-token';
      mockApiClient.onPost('/auth/login').reply(200, {
        access_token: mockToken,
        token_type: 'bearer',
      });
      mockApiClient.onGet('/user').reply(200, mockUser);

      await store.login('test@example.com', 'password');

      expect(store.accessToken).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
    });

    it('should throw error when login failed', async () => {
      const store = useAuthStore();
      mockApiClient.onPost('/auth/login').reply(401, {
        detail: 'Invalid credentials',
      });

      await expect(store.login('test@example.com', 'wrong-password')).rejects.toThrow();

      expect(store.accessToken).toBe(null);
      expect(store.user).toBe(null);
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const store = useAuthStore();
      mockApiClient.onPost('/auth/signup').reply(201, mockUser);

      await store.signup('test@example.com', 'password');

      expect(mockApiClient.history.post.length).toBe(1);
      expect(JSON.parse(mockApiClient.history.post[0].data)).toEqual({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should throw error when fail to signup', async () => {
      const store = useAuthStore();
      mockApiClient.onPost('/auth/signup').reply(400, {
        detail: 'Email already exists',
      });

      await expect(store.signup('test@example.com', 'password')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout and clear token on success', async () => {
      const store = useAuthStore();
      store.setAccessToken('some-token');
      store.user = mockUser;
      mockApiClient.onPost('/auth/logout').reply(200);

      await store.logout();

      expect(store.accessToken).toBe(null);
      expect(store.user).toBe(null);
    });

    it('should logout and clear token even if request fails', async () => {
      const store = useAuthStore();
      store.setAccessToken('some-token');
      store.user = mockUser;
      mockApiClient.onPost('/auth/logout').reply(500);

      await store.logout();

      expect(store.accessToken).toBe(null);
      expect(store.user).toBe(null);
    });
  });

  describe('init', () => {
    it('should initialize token from refresh', async () => {
      const store = useAuthStore();
      const mockToken = 'refreshed-token';
      mockAuthClient.onPost('/auth/refresh').reply(200, {
        access_token: mockToken,
        token_type: 'bearer',
      });
      mockApiClient.onGet('/user').reply(200, mockUser);

      await store.init();

      expect(store.accessToken).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
      expect(store.isInitialized).toBe(true);
    });

    it('should not set token if refresh fails', async () => {
      const store = useAuthStore();
      mockAuthClient.onPost('/auth/refresh').reply(401);

      await store.init();

      expect(store.accessToken).toBe(null);
      expect(store.user).toBe(null);
      expect(store.isInitialized).toBe(true);
    });

    it('should not initialize twice', async () => {
      const store = useAuthStore();
      const mockToken = 'refreshed-token';
      mockAuthClient.onPost('/auth/refresh').reply(200, {
        access_token: mockToken,
        token_type: 'bearer',
      });
      mockApiClient.onGet('/user').reply(200, mockUser);
      await store.init();
      const firstToken = store.accessToken;

      await store.init();

      expect(store.accessToken).toBe(firstToken);
      expect(mockAuthClient.history.post.length).toBe(1);
    });
  });
});
