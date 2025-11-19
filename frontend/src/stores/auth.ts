import type { UserLoginResponse } from '@/types/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import apiClient from '@/api/client';
import { useAlertStore } from '@/stores/error';
import { useClientIdStore } from '@/stores/clientId';
import { useRoute, useRouter } from 'vue-router';

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

  const login = async (email: string, password: string) => {
    const errorStore = useAlertStore();
    const clientIdStore = useClientIdStore();
    const route = useRoute();
    const router = useRouter();

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
      const redirectPath = route.query.redirect || '/weeks';
      router.push(redirectPath as string);
    } catch (err: any) {
      errorStore.addError(err.response?.data?.detail || 'Login failed');
    }
  };

  const signup = async (email: string, password: string) => {
    const errorStore = useAlertStore();
    const router = useRouter();

    try {
      const res = await apiClient.post('/auth/signup', {
        email: email,
        password: password,
      });
      if (res.status == 201) router.push('/login');
    } catch (err: any) {
      errorStore.addError(err.message);
    }
  };

  return {
    access_token,
    isAuthenticated,
    setToken,
    clearToken,
    login,
    signup,
  };
});
