import { ref, computed } from 'vue';
import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import { apiClient, authClient } from './client';

/**
 * Publicly visible information about a user.
 */
export interface UserData {
  user_id: string;
  email: string;
  is_active: boolean;
  username?: string;
  avatar_url?: string;
}

/**
 * Token information returned upon successful login.
 */
export interface LoginInfo {
  access_token: string;
  token_type: string;
}

/**
 * Payload for registering a new user.
 */
export interface SignUpPayload {
  email: string;
  username: string;
  password: string;
}

/**
 * Reactive reference to the current JWT access token.
 */
export const accessToken = ref<string | null>(null);

/**
 * Computed property indicating whether the user is currently authenticated.
 */
export const isAuthenticated = computed(() => !!accessToken.value);

/**
 * Cache keys for authentication-related queries.
 */
const AUTH_KEYS = {
  root: ['auth'] as const,
  user: () => [...AUTH_KEYS.root, 'user'] as const,
};

/**
 * Query options for fetching the current authenticated user's profile.
 */
export const getUserQuery = defineQueryOptions(() => ({
  key: AUTH_KEYS.user(),
  query: () => apiClient.get<UserData>('/user').then((res) => res.data),
  staleTime: 60_000,
}));

/**
 * Mutation for logging in a user.
 * Stores the received access token and invalidates user data cache.
 */
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

/**
 * Mutation for registering a new user.
 */
export const signupMutation = defineMutation(() => {
  return {
    mutation: (payload: SignUpPayload) =>
      apiClient.post<UserData>('/auth/signup', payload).then((res) => res.data),
    onSuccess: () => console.debug('SignUp successful'),
    onError: (err: Error) => console.error('SignUp failed: ', err),
  };
});

/**
 * Mutation for logging out the current user.
 * Clears the access token and invalidates relevant caches.
 */
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
      queryCache.invalidateQueries({ key: AUTH_KEYS.user() });
    },
  };
});

let refreshPromise: Promise<string> | null = null;

/**
 * Attempts to refresh the JWT access token using the HTTP-only refresh cookie.
 * Ensures only one refresh request is in flight at a time.
 *
 * @returns A promise that resolves to the new access token.
 */
export const refreshToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = authClient
    .post<LoginInfo>('/auth/refresh')
    .then((res) => {
      const data = res.data;
      accessToken.value = data.access_token;
      return accessToken.value ?? '';
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * Initializes the authentication state by attempting to refresh the token.
 */
export const initAuth = async () => {
  try {
    await refreshToken();
  } catch (err: unknown) {
    console.error('Auth initialization failed:', err);
    accessToken.value = null;
  }
};
