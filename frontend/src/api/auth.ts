import { ref } from 'vue';
import { defineMutation, useQuery, useQueryCache } from '@pinia/colada';
import { apiClient, authClient } from './client';
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { toast } from 'vue-sonner';
import { USER_KEYS, getUserQuery } from './user';

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
 * Standard generic response for successful auth requests.
 */
export interface SuccessResponse {
  status: string;
}

/**
 * Reactive reference indicating whether the user is currently authenticated.
 * Initialized synchronously from a localStorage hint flag.
 */
export const isAuthenticated = ref<boolean>(localStorage.getItem('isLogged') === 'true');

/**
 * Mutation for logging in a user.
 * Invalidates user data cache on success.
 */
export const loginMutation = defineMutation(() => {
  const router = useRouter();
  const queryCache = useQueryCache();

  return {
    mutation: (payload: LoginPayload) => {
      const params = new URLSearchParams({ username: payload.email, password: payload.password });
      return apiClient.post<SuccessResponse>('/auth/login', params).then((res) => res.data);
    },
    onSuccess: () => {
      toast.success('Logged in successfully!');
      isAuthenticated.value = true;
      localStorage.setItem('isLogged', 'true');
      queryCache.invalidateQueries({ key: USER_KEYS.profile() });
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
      apiClient.post<void>('/auth/signup', payload).then((res) => res.data),
    onSuccess: async () => {
      toast.success('Registration complete!');
      isAuthenticated.value = true;
      localStorage.setItem('isLogged', 'true');
      queryCache.invalidateQueries({ key: USER_KEYS.profile() });
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
    onSettled: () => {
      queryCache.invalidateQueries({ key: USER_KEYS.profile() });
      isAuthenticated.value = false;
      localStorage.removeItem('isLogged');
    },
  };
});

let refreshPromise: Promise<SuccessResponse> | null = null;

/**
 * Attempts to refresh the JWT access token using the HTTP-only refresh cookie.
 * Ensures only one refresh request is in flight at a time.
 *
 * @returns A promise that resolves with the success response if refreshed, or rejects on failure.
 * @throws {AxiosError} If the refresh request fails.
 */
export const refreshToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = authClient
    .post<SuccessResponse>('/auth/refresh')
    .then((res) => {
      isAuthenticated.value = true;
      localStorage.setItem('isLogged', 'true');
      return res.data;
    })
    .catch((err) => {
      isAuthenticated.value = false;
      localStorage.removeItem('isLogged');
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * Initializes the authentication state by attempting to fetch the user profile.
 * This should be called once when the application starts to restore the session.
 *
 * @returns A promise that resolves when initialization is complete.
 */
export const initAuth = async () => {
  const { refresh } = useQuery(getUserQuery());

  const state = await refresh();

  if (state.status === 'success') {
    isAuthenticated.value = true;
    localStorage.setItem('isLogged', 'true');
  } else {
    isAuthenticated.value = false;
    localStorage.removeItem('isLogged');
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
      apiClient.post<SuccessResponse>('/auth/google/exchange', { code }).then((res) => res.data),
    onSuccess: () => {
      toast.success('Logged in successfully!');
      isAuthenticated.value = true;
      localStorage.setItem('isLogged', 'true');
      router.push({ name: ROUTE_NAMES.WEEKS });
    },
    onError: (err: Error) => {
      toast.error(`Request failed: ${err.message}`);
    },
    onSettled: () => {
      queryCache.invalidateQueries({ key: USER_KEYS.profile() });
    },
  };
});
