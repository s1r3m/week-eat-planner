import type { AccessToken } from '@/api/types';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import { apiClient, authClient, getErrorMessage } from '@/api/client';
import { useAlertStore } from '@/stores/error';

export const useAuthStore = defineStore('auth-store', () => {
  const accessToken: Ref<string | null> = ref(null);

  const setAccessToken = (newToken: string | null) => {
    accessToken.value = newToken;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const errorStore = useAlertStore();
    const params = new URLSearchParams({
      username: email,
      password: password,
    });
    try {
      const res = await apiClient.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      accessToken.value = (res.data as AccessToken).access_token;
      return true;
    } catch (err: unknown) {
      errorStore.addError(getErrorMessage(err));
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    const errorStore = useAlertStore();
    try {
      const res = await apiClient.post('/auth/signup', {
        email: email,
        password: password,
      });
      return res.status === 201;
    } catch (err: unknown) {
      errorStore.addError(getErrorMessage(err));
      return false;
    }
  };

  const logout = async () => {
    const errorStore = useAlertStore();
    try {
      await apiClient.post('/auth/logout');
    } catch (err: unknown) {
      errorStore.addError(getErrorMessage(err));
    } finally {
      setAccessToken(null);
      console.log('Cleared access_token');
    }
  };

  const init = async () => {
    try {
      const res = await authClient.post<AccessToken>('auth/refresh');
      const newToken = res.data.access_token;
      setAccessToken(newToken);
      console.log('Initialized access_token from refresh');
    } catch (err: unknown) {
      console.log('No valid refresh token found: ', getErrorMessage(err));
    }
  };

  return {
    accessToken,
    setAccessToken,
    init,
    login,
    signup,
    logout,
  };
});
