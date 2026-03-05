import type { UserInfo } from '@/domain/auth/models';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import { getErrorMessage } from '@/api/client';
import { authService } from '../api/auth.service';

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

    const data = await authService.login(params);
    accessToken.value = data.access_token;
    await _setUser();
  };

  const signup = async (email: string, password: string) => {
    await authService.signup(email, password);
  };

  const logout = async () => {
    setAccessToken(null);
    user.value = null;
    await authService.logout();
    console.log('Cleared access_token');
  };

  const init = async () => {
    try {
      const data = await authService.refresh();
      setAccessToken(data.access_token);
      await _setUser();
      console.log('Initialized access_token from refresh');
    } catch (err: unknown) {
      console.log('No valid refresh token found: ', getErrorMessage(err));
    }
  };

  const _setUser = async () => {
    const data = await authService.getCurrentUser();
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
