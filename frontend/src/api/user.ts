import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import { apiClient, authClient } from './client';

const USER_KEYS = {
  root: 'user' as const,
  profile: () => [...USER_KEYS.root, 'profile'],
};
/**
 * Publicly visible information about a user.
 */
export interface UserData {
  user_id: string;
  email: string;
  is_active: boolean;
  username: string;
  avatar_url?: string;
}

/**
 * Query options for fetching the current authenticated user's profile.
 */
export const getUserQuery = defineQueryOptions(() => ({
  key: USER_KEYS.profile(),
  query: () => apiClient.get<UserData>('/user').then((res) => res.data),
  staleTime: 60_000,
}));

/**
 * Mutatiion for updating user data.
 */
export const updateUserMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  return {
    mutation: (data: UserData) => apiClient.post<UserData>('/users', data).then((res) => res.data),
  };
});
