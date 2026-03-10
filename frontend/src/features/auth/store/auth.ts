import type { UserInfo } from '@/domain/auth/models';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import { getErrorMessage } from '@/api/client';
import { authService } from '../api/auth.service';

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

    const data = await authService.login(params);
    accessToken.value = data.accessToken;
    await _setUser();
  };

  const signup = async (email: string, password: string) => {
    await authService.signup(email, password);
  };

  const logout = async () => {
    try {
      await authService.logout();
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
      const data = await authService.refresh();
      setAccessToken(data.accessToken);
      await _setUser();
      console.log('Initialized access_token from refresh');
    } catch (err: unknown) {
      console.log('No valid refresh token found: ', getErrorMessage(err));
    } finally {
      isInitialized.value = true;
    }
  };

  const _setUser = async () => {
    const data = await authService.getCurrentUser();
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
