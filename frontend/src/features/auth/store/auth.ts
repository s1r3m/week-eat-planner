import type { AccessToken, LoginInfo, UserInfo } from '@/app/api/types';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import { apiClient, authClient, getErrorMessage } from '@/app/api/client';

export const useAuthStore = defineStore('auth-store', () => {
  const accessToken: Ref<string | null> = ref(null);
  const user: Ref<UserInfo | null> = ref(null);

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
    setAccessToken(null);
    user.value = null;
    await apiClient.post('/auth/logout');
    console.log('Cleared access_token');
  };

  const init = async () => {
    try {
      const { data } = await authClient.post<AccessToken>('/auth/refresh');
      setAccessToken(data.access_token);
      await _setUser();
      console.log('Initialized access_token from refresh');
    } catch (err: unknown) {
      console.log('No valid refresh token found: ', getErrorMessage(err));
    }
  };

  const _setUser = async () => {
    const { data } = await apiClient.get<UserInfo>('/user');
    user.value = data;
  };

  return {
    accessToken,
    user,
    setAccessToken,
    init,
    login,
    signup,
    logout,
  };
});
