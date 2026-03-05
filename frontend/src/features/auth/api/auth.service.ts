import { apiClient, authClient } from '@/api/client';
import type { AccessToken, LoginInfo, UserInfo } from '@/domain/auth/models';

export const authService = {
  async login(params: URLSearchParams): Promise<LoginInfo> {
    const { data } = await apiClient.post<LoginInfo>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return data;
  },

  async signup(email: string, password: string): Promise<UserInfo> {
    const { data } = await apiClient.post<UserInfo>('/auth/signup', {
      email,
      password,
    });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refresh(): Promise<AccessToken> {
    const { data } = await authClient.post<AccessToken>('/auth/refresh');
    return data;
  },

  async getCurrentUser(): Promise<UserInfo> {
    const { data } = await apiClient.get<UserInfo>('/user');
    return data;
  },
};
