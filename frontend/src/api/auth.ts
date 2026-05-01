import { ref, computed } from 'vue';
import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import { apiClient, authClient } from './client';
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { toast } from 'vue-sonner';

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
 * Payload to login a user.
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Payload for registering a new user.
 */
export interface SignUpPayload extends LoginPayload {
  username: string;
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
  const router = useRouter();
  const queryCache = useQueryCache();

  return {
    mutation: (payload: LoginPayload) => {
      const params = new URLSearchParams({ username: payload.email, password: payload.password });
      return apiClient.post<LoginInfo>('/auth/login', params).then((res) => res.data);
    },
    onSuccess: (data: LoginInfo) => {
      toast.success('Logged in successfully!');
      accessToken.value = data.access_token;
      queryCache.invalidateQueries({ key: AUTH_KEYS.user() });
      router.push({ name: ROUTE_NAMES.WEEKS });
    },
  };
});

/**
 * Mutation for registering a new user.
 */
export const signupMutation = defineMutation(() => {
  const router = useRouter();
  const queryCache = useQueryCache();

  return {
    mutation: (payload: SignUpPayload) =>
      apiClient.post<LoginInfo>('/auth/signup', payload).then((res) => res.data),
    onSuccess: async (data: LoginInfo) => {
      toast.success('Registration complete!');
      accessToken.value = data.access_token;
      queryCache.invalidateQueries({ key: AUTH_KEYS.user() });
      await router.push({ name: ROUTE_NAMES.WEEKS });
    },
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
      accessToken.value = null;
    },
    onError: (_err: Error) => {
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
      accessToken.value = res.data.access_token;
      return accessToken.value;
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
    accessToken.value = null;
  }
};

/**
 * Mutation for authenticating a user via Google OAuth.
 * Exchanges the authorization code for an access token and redirects to the weeks page.
 */
export const googleAuthMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  const router = useRouter();

  return {
    mutation: (code: string) =>
      apiClient.post<LoginInfo>('/auth/google/exchange', { code }).then((res) => res.data),
    onSuccess: (response: LoginInfo) => {
      toast.success('Logged in successfully!');
      accessToken.value = response.access_token;
      router.push({ name: ROUTE_NAMES.WEEKS });
    },
    onError: (err: Error) => {
      toast.error(`Request failed: ${err.message}`);
    },
    onSettled: () => {
      queryCache.invalidateQueries({ key: AUTH_KEYS.user() });
    },
  };
});
