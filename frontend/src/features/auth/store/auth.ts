import type { LoginInfo, UserInfo } from '@/domain/auth/models';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import { apiClient, authClient, getErrorMessage } from '@/api/client';

/** Shared promise for token refresh to prevent multiple simultaneous calls. */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Store for managing authentication and user session.
 */
export const useAuthStore = defineStore('auth-store', () => {
  /** The current session access token. */
  const accessToken: Ref<string | null> = ref(null);
  /** Information about the currently logged-in user. */
  const user: Ref<UserInfo | null> = ref(null);
  /** Whether the authentication state has been initialized. */
  const isInitialized = ref(false);

  /**
   * Sets the access token.
   * @param newToken - The new access token, or null to clear it.
   */
  const setAccessToken = (newToken: string | null) => {
    accessToken.value = newToken;
  };

  /**
   * Performs user login.
   * @param email - User email.
   * @param password - User password.
   * @returns A promise that resolves when the login is successful.
   */
  const login = async (email: string, password: string) => {
    const params = new URLSearchParams({
      username: email,
      password,
    });

    const { data } = await apiClient.post<LoginInfo>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    accessToken.value = data.access_token;
    await _setUser();
  };

  /**
   * Performs user signup.
   * @param email - User email.
   * @param password - User password.
   * @returns A promise that resolves when the signup is successful.
   */
  const signup = async (email: string, password: string) => {
    await apiClient.post<UserInfo>('/auth/signup', {
      email,
      password,
    });
  };

  /**
   * Performs user logout.
   * @returns A promise that resolves when the logout is complete.
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err: unknown) {
      console.error(`An error during logout: ${err}`);
    }
    setAccessToken(null);
    user.value = null;
    console.log('Cleared access_token');
  };

  /**
   * Refreshes the access token using the refresh token.
   * Deduplicates multiple calls into a single promise.
   * @returns A promise that resolves to the new access token or null on failure.
   */
  const refreshToken = async (): Promise<string | null> => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const { data } = await authClient.post<LoginInfo>('/auth/refresh');
        setAccessToken(data.access_token);
        console.log('Token refreshed successfully');
        return data.access_token;
      } catch (err: unknown) {
        console.error('Token refresh failed:', getErrorMessage(err));
        setAccessToken(null);
        user.value = null;
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  /**
   * Initializes the authentication state from refresh token.
   * @returns A promise that resolves when initialization is complete.
   */
  const init = async () => {
    if (isInitialized.value) return;

    try {
      const token = await refreshToken();
      if (token) {
        await _setUser();
      }
    } catch (err: unknown) {
      console.log('Initialization failed: ', getErrorMessage(err));
    } finally {
      isInitialized.value = true;
    }
  };

  /**
   * Internal helper to fetch user info.
   */
  const _setUser = async () => {
    const { data } = await apiClient.get<UserInfo>('/user');
    user.value = data;
  };

  return {
    accessToken,
    user,
    isInitialized,
    setAccessToken,
    init,
    login,
    signup,
    logout,
    refreshToken,
  };
});
