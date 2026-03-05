import { computed } from 'vue';
import type { AccessToken, LoginInfo, UserInfo } from '@/app/api/types';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import { apiClient, authClient, getErrorMessage } from '@/app/api/client';
import { useAlertStore } from '@/stores/error';

export const useAuthStore = defineStore('auth-store', () => {
  const accessToken: Ref<string | null> = ref(null);
  const isLoading: Ref<boolean> = ref(false);
  const user: Ref<UserInfo | null> = ref(null);

  const isAuthenticated = computed(() => !!accessToken.value);

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
    await setUser();
  };

  const signup = async (email: string, password: string) => {
    await apiClient.post<UserInfo>('/auth/signup', {
      email,
      password,
    });
  };

  const logout = async () => {
    const errorStore = useAlertStore();
    isLoading.value = true;
    try {
      await apiClient.post('/auth/logout');
    } catch (err: unknown) {
      errorStore.addError(getErrorMessage(err));
    } finally {
      setAccessToken(null);
      user.value = null;
      console.log('Cleared access_token');
      isLoading.value = false;
    }
  };

  const init = async () => {
    try {
      const res = await authClient.post<AccessToken>('/auth/refresh');
      const newToken = res.data.access_token;
      setAccessToken(newToken);
      await setUser();
      console.log('Initialized access_token from refresh');
    } catch (err: unknown) {
      console.log('No valid refresh token found: ', getErrorMessage(err));
    }
  };

  const setUser = async () => {
    if (user.value) console.error('wtf, user exists');

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
    isAuthenticated,
    isLoading,
  };
});
