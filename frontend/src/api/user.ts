import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import { apiClient } from './client';
import { toast } from 'vue-sonner';

/** Cache keys for user-related queries. */
export const USER_KEYS = {
  root: 'user' as const,
  profile: () => [USER_KEYS.root, 'profile'],
};

/**
 * Publicly visible information about a user.
 */
export interface UserData {
  id: string;
  email: string;
  is_active: boolean;
  username: string;
  avatar_url?: string;
}

/** Payload for updating user profile fields. */
export interface UserPayload {
  username?: string;
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
 * Mutation for updating user data.
 * Optimistically applies changes to the profile cache and rolls back on error.
 */
export const updateUserMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  return {
    mutation: (data: UserPayload) =>
      apiClient.patch<UserData>('/user', data).then((res) => res.data),
    onMutate: (data: UserPayload) => {
      queryCache.cancelQueries({ key: USER_KEYS.profile() });
      const previous = queryCache.getQueryData<UserData>(USER_KEYS.profile());
      queryCache.setQueryData(USER_KEYS.profile(), { ...previous, ...data });
      return { previous };
    },
    onError: (_err: Error, _data: UserPayload, context?: { previous?: UserData }) => {
      if (context?.previous) queryCache.setQueryData(USER_KEYS.profile(), context.previous);
    },
    onSuccess: (_resp: UserData, _data: UserPayload, _context?: { previous?: UserData }) => {
      toast.success('Profile updated');
    },
    onSettled: () => {
      queryCache.invalidateQueries({ key: USER_KEYS.profile() });
    },
  };
});
