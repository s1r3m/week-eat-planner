import type { UserLoginResponse } from '@/types/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import apiClient from '@/api/client';
import { useAlertStore } from '@/stores/error';
import { useClientIdStore } from '@/stores/clientId';

export const useAuthStore = defineStore('auth-store', () => {
  const access_token = ref<string | null>(null);

  const setToken = (data: UserLoginResponse) => {
    console.log('Setting access_token');
    if (data.token_type !== 'bearer') {
      return;
    }
    access_token.value = data.access_token;
  };

  const clearToken = () => {
    access_token.value = null;
    console.log('Cleared access_token from localStorage');
  };

  const isAuthenticated = computed(() => !!access_token.value);

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
    access_token,
    isAuthenticated,
    setToken,
    clearToken,
    login,
    signup,
    logout,
  };
});
