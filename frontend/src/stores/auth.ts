import type { UserLoginResponse } from '@/types/api';
import { defineStore } from 'pinia';
import { ref, computed, type Ref } from 'vue';

import apiClient, { refreshClient } from '@/api/client';
import { useAlertStore } from '@/stores/error';
import { useClientIdStore } from '@/stores/clientId';

export const useAuthStore = defineStore('auth-store', () => {
  const accessToken: Ref<string | null> = ref(null);

  const setToken = (data: UserLoginResponse) => {
    if (data.token_type !== 'bearer') {
      return;
    }
    accessToken.value = data.access_token;
  };

  const clearToken = () => {
    accessToken.value = null;
    console.log('Cleared access_token');
  };

  const refreshToken = async () => {
    const clientIdStore = useClientIdStore();
    try {
      const response = await refreshClient.post('/refresh', {
        client_id: clientIdStore.getClientId(),
      });
      if (response.status !== 200) {
        throw new Error(`Status: ${response.status}`);
      }
      setToken(response.data as UserLoginResponse);
    } catch (err: any) {
      console.error(`An error during silent refresh on start: ${err}`);
      clearToken();
    }
  };

  const isAuthenticated = computed(() => !!accessToken.value);

  const login = async (email: string, password: string): Promise<boolean> => {
    const errorStore = useAlertStore();
    const clientIdStore = useClientIdStore();
    const params = new URLSearchParams({
      username: email,
      password: password,
      client_id: clientIdStore.getClientId(),
    });
    try {
      const res = await apiClient.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setToken(res.data);
      return true;
    } catch (err: any) {
      errorStore.addError(err.response?.data?.detail || 'Login failed');
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
    } catch (err: any) {
      errorStore.addError(err.message);
      return false;
    }
  };

  const logout = async () => {
    const errorStore = useAlertStore();
    try {
      await apiClient.post('/auth/logout');
    } catch (err: any) {
      errorStore.addError(err.response?.data?.detail || 'Logout failed');
    } finally {
      clearToken();
    }
  };

  return {
    accessToken,
    isAuthenticated,
    setToken,
    clearToken,
    refreshToken,
    login,
    signup,
    logout,
  };
});
