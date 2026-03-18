import type { LoginInfo, UserInfo } from '@/domain/auth/models';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import { apiClient, authClient, getErrorMessage } from '@/api/client';

export const useAuthStore = defineStore('auth-store', () => {
  const accessToken: Ref<string | null> = ref(null);
  const user: Ref<UserInfo | null> = ref(null);
  const isInitialized = ref(false);

  const setAccessToken = (newToken: string | null) => {
    accessToken.value = newToken;
  };

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

  const signup = async (email: string, password: string) => {
    await apiClient.post<UserInfo>('/auth/signup', {
      email,
      password,
    });
  };

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

  const init = async () => {
    if (isInitialized.value) return;

    try {
      const { data } = await authClient.post<LoginInfo>('/auth/refresh');
      setAccessToken(data.access_token);
      await _setUser();
      console.log('Initialized access_token from refresh');
    } catch (err: unknown) {
      console.log('No valid refresh token found: ', getErrorMessage(err));
    } finally {
      isInitialized.value = true;
    }
  };

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
  };
});
