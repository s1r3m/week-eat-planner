import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { createPinia, setActivePinia } from 'pinia';
import { toast } from 'vue-sonner';
import { apiClient } from '../client';
import { getUserQuery, updateUserMutation, USER_KEYS } from '../user';
import type { UserData, UserPayload } from '../user';

const mockQueryCache = {
  cancelQueries: vi.fn(),
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn(),
};

vi.mock('@pinia/colada', () => ({
  defineQueryOptions: (fn: any) => fn,
  defineMutation: (fn: any) => fn,
  useQueryCache: () => mockQueryCache,
}));

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('user api', () => {
  let mockApi: MockAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = new MockAdapter(apiClient);
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockApi.restore();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('getUserQuery', () => {
    it('uses the correct cache key', () => {
      const options = getUserQuery() as any;
      expect(options.key).toEqual(USER_KEYS.profile());
    });

    it('fetches the current user profile', async () => {
      const mockData: UserData = {
        id: '1',
        email: 'test@example.com',
        username: 'tester',
        is_active: true,
      };
      mockApi.onGet('/user').reply(200, mockData);

      const options = getUserQuery() as any;
      const result = await options.query();
      expect(result).toEqual(mockData);
    });
  });

  describe('updateUserMutation', () => {
    const payload: UserPayload = { username: 'newname', email: 'new@example.com' };
    const existing: UserData = {
      id: '1',
      email: 'old@example.com',
      username: 'oldname',
      is_active: true,
    };

    it('patches /user and returns the updated user', async () => {
      const updated: UserData = { ...existing, ...payload };
      mockApi.onPatch('/user', payload).reply(200, updated);

      const config = updateUserMutation() as any;
      const result = await config.mutation(payload);
      expect(result).toEqual(updated);
    });

    describe('onMutate', () => {
      it('cancels in-flight queries, snapshots previous data, and applies optimistic update', () => {
        mockQueryCache.getQueryData.mockReturnValue(existing);

        const config = updateUserMutation() as any;
        const context = config.onMutate(payload);

        expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: USER_KEYS.profile() });
        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(USER_KEYS.profile(), {
          ...existing,
          ...payload,
        });
        expect(context).toEqual({ previous: existing });
      });

      it('applies the update even when there is no existing cache entry', () => {
        mockQueryCache.getQueryData.mockReturnValue(undefined);

        const config = updateUserMutation() as any;
        config.onMutate(payload);

        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(USER_KEYS.profile(), {
          undefined,
          ...payload,
        });
      });
    });

    describe('onError', () => {
      it('restores the previous cache when context is available', () => {
        const context = { previous: existing };

        const config = updateUserMutation() as any;
        config.onError(new Error('Failed'), payload, context);

        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(USER_KEYS.profile(), existing);
      });

      it('does nothing when context has no previous data', () => {
        const config = updateUserMutation() as any;
        config.onError(new Error('Failed'), payload, {});
        expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
      });
    });

    describe('onSuccess', () => {
      it('shows a success toast', () => {
        const config = updateUserMutation() as any;
        config.onSuccess({ ...existing, ...payload }, payload, {});
        expect(toast.success).toHaveBeenCalledWith('Profile updated');
      });
    });

    describe('onSettled', () => {
      it('invalidates the profile query', () => {
        const config = updateUserMutation() as any;
        config.onSettled();
        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: USER_KEYS.profile() });
      });
    });
  });
});
