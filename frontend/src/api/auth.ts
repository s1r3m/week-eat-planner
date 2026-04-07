import { ref, computed } from 'vue';
import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import { apiClient, authClient } from './client';

export interface UserInfo {
  user_id: string;
  email: string;
  is_active: boolean;
  username?: string;
  avatar_url?: string;
}

export interface LoginInfo {
  access_token: string;
  token_type: string;
}

export interface SignUpPayload {
  email: string;
  username: string;
  password: string;
}

export const accessToken = ref<string | null>(null);
export const isAuthenticated = computed(() => !!accessToken.value);

const AUTH_KEYS = {
  root: ['auth'] as const,
  user: () => [...AUTH_KEYS.root, 'user'] as const,
};

export const getUserQuery = defineQueryOptions(() => ({
  key: AUTH_KEYS.user(),
  query: () => apiClient.get<UserInfo>('/user').then((res) => res.data),
  staleTime: 60_000,
}));

export const loginMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: (params: URLSearchParams) =>
      apiClient.post<LoginInfo>('/auth/login', params).then((res) => res.data),
    onSuccess: (data: LoginInfo) => {
      accessToken.value = data.access_token;
      queryCache.invalidateQueries({ key: AUTH_KEYS.user() });
    },
    onError: () => console.error('Login failed'),
  };
});

export const signupMutation = defineMutation(() => {
  return {
    mutation: (payload: SignUpPayload) =>
      apiClient.post<UserInfo>('/auth/signup', payload).then((res) => res.data),
    onSuccess: () => console.debug('Signup successful'),
    onError: (err: Error) => console.error('Signup failed: ', err),
  };
});

export const logoutMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  return {
    mutation: () => apiClient.post<void>('/auth/logout').then(() => undefined),
    onSuccess: () => {
      console.debug('Logout successful');
      accessToken.value = null;
    },
    onError: (err: Error) => {
      console.error('Logout failed: ', err);
      accessToken.value = null;
    },
    onSettled: () => {
      queryCache.setQueryData(AUTH_KEYS.user(), () => null);
      queryCache.invalidateQueries({ key: AUTH_KEYS.user() });
    },
  };
});

let refreshPromise: Promise<string> | null = null;
export const refreshToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = authClient
    .post<LoginInfo>('/auth/refresh')
    .then((res) => {
      const data = res.data;
      accessToken.value = data.access_token;
      return accessToken.value;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const initAuth = async () => {
  try {
    await authClient.post<LoginInfo>('/auth/refresh').then((res) => {
      const data = res.data;
      accessToken.value = data.access_token;
    });
  } catch (err: unknown) {
    accessToken.value = null;
  }
};
