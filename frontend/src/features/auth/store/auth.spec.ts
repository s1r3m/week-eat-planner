import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from './auth';
import { apiClient, authClient } from '@/app/api/client';
import { useAlertStore } from '@/stores/error';
import MockAdapter from 'axios-mock-adapter';

describe('auth store', () => {
  let mockApiClient: MockAdapter;
  let mockAuthClient: MockAdapter;

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
  });

  it('should set access token', () => {
    const store = useAuthStore();
    store.setAccessToken('test-token');
    expect(store.accessToken).toBe('test-token');
  });

  describe('isAuthenticated', () => {
    it('should be true if accessToken is present', () => {
      const store = useAuthStore();
      store.setAccessToken('test-token');

      expect(store.isAuthenticated).toBe(true);
    });

    it('should be false if accessToken is null', () => {
      const store = useAuthStore();
      store.setAccessToken(null);

      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const store = useAuthStore();
      const mockToken = 'new-access-token';
      mockApiClient.onPost('/auth/login').reply(200, {
        access_token: mockToken,
        token_type: 'bearer',
      });

      const result = await store.login('test@example.com', 'password');

      expect(result).toBe(true);
      expect(store.accessToken).toBe(mockToken);
    });

    it('should add error to alert store when login failed', async () => {
      const store = useAuthStore();
      const alertStore = useAlertStore();
      mockApiClient.onPost('/auth/login').reply(401, {
        detail: 'Invalid credentials',
      });

      const result = await store.login('test@example.com', 'wrong-password');

      expect(result).toBe(false);
      expect(store.accessToken).toBe(null);
      expect(alertStore.getAllErrors()).toContain('Invalid credentials');
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const store = useAuthStore();
      mockApiClient.onPost('/auth/signup').reply(201, {
        email: 'test@example.com',
        id: '123e4567-e89b-12d3-a456-42661',
        is_active: true,
      });

      const result = await store.signup('test@example.com', 'password');

      expect(result).toBe(true);
    });

    it('should add error to alert store when fail to signup', async () => {
      const store = useAuthStore();
      const alertStore = useAlertStore();
      mockApiClient.onPost('/auth/signup').reply(400, {
        detail: 'Email already exists',
      });

      const result = await store.signup('test@example.com', 'password');

      expect(result).toBe(false);
      expect(alertStore.getAllErrors()).toContain('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout and clear token on success', async () => {
      const store = useAuthStore();
      store.setAccessToken('some-token');
      mockApiClient.onPost('/auth/logout').reply(200);

      await store.logout();

      expect(store.accessToken).toBe(null);
    });

    it('should logout and clear token even if request fails', async () => {
      const store = useAuthStore();
      store.setAccessToken('some-token');
      mockApiClient.onPost('/auth/logout').reply(500);

      await store.logout();

      expect(store.accessToken).toBe(null);
    });
  });

  describe('init', () => {
    it('should initialize token from refresh', async () => {
      const store = useAuthStore();
      const mockToken = 'refreshed-token';
      mockAuthClient.onPost('auth/refresh').reply(200, {
        access_token: mockToken,
        token_type: 'bearer',
      });

      await store.init();

      expect(store.accessToken).toBe(mockToken);
    });

    it('should not set token if refresh fails', async () => {
      const store = useAuthStore();
      mockAuthClient.onPost('auth/refresh').reply(401);

      await store.init();

      expect(store.accessToken).toBe(null);
    });
  });
});
