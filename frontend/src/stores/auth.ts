import type { UserLoginResponse } from '@/types/api';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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

  return {
    access_token,
    isAuthenticated,
    setToken,
    clearToken,
  };
});
