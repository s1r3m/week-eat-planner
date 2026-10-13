import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { createPinia, setActivePinia } from 'pinia';
import { apiClient } from '../client';
import {
  getShoppingListQuery,
  createShoppingListMutation,
  updateShoppingListMutation,
  deleteShoppingListMutation,
} from '../shoppingList';
import { WEEK_KEYS } from '../weeks';
import { useQueryCache } from '@pinia/colada';
import { toast } from 'vue-sonner';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const mockRouter = { push: vi.fn() };
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@pinia/colada', () => ({
  defineQueryOptions: (fn: any) => fn,
  defineMutation: (fn: any) => fn,
  useQueryCache: vi.fn(),
}));

describe('shoppingList api', () => {
  let mockApi: MockAdapter;
  const weekId = 'week-123';
  const mockShoppingList = {
    week_id: weekId,
    items: [{ name: 'Apples', amount: 5, unit: 'pcs' as const, checked: false }],
  };

  const mockCache = {
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = new MockAdapter(apiClient);
    vi.mocked(useQueryCache).mockReturnValue(mockCache as any);
  });

  afterEach(() => {
    mockApi.restore();
    vi.clearAllMocks();
  });

  describe('getShoppingListQuery', () => {
    it('uses the correct cache key', () => {
      const options = getShoppingListQuery(weekId) as any;
      expect(options.key).toEqual(WEEK_KEYS.shopping_list(weekId));
    });

    it('fetches the shopping list', async () => {
      mockApi.onGet(`/weeks/${weekId}/shopping-list`).reply(200, mockShoppingList);

      const options = getShoppingListQuery(weekId) as any;
      const result = await options.query();
      expect(result).toEqual(mockShoppingList);
    });
  });

  describe('createShoppingListMutation', () => {
    it('posts to create shopping list', async () => {
      mockApi.onPost(`/weeks/${weekId}/shopping-list`).reply(200, mockShoppingList);

      const config = createShoppingListMutation() as any;
      const result = await config.mutation(weekId);
      expect(result).toEqual(mockShoppingList);
    });

    it('handles onMutate', () => {
      const config = createShoppingListMutation() as any;
      config.onMutate(weekId);
      expect(mockCache.cancelQueries).toHaveBeenCalledWith({
        key: WEEK_KEYS.shopping_list(weekId),
      });
    });

    it('handles onSuccess', () => {
      const config = createShoppingListMutation() as any;
      config.onSuccess(mockShoppingList, weekId);

      expect(mockCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.shopping_list(weekId),
        mockShoppingList,
      );
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: ROUTE_NAMES.SHOPPING_LIST,
        params: { id: weekId },
      });
    });

    it('handles onError with 409 conflict', () => {
      const config = createShoppingListMutation() as any;
      const error = { response: { status: 409 }, isAxiosError: true };

      config.onError(error, weekId);

      expect(mockRouter.push).toHaveBeenCalledWith({
        name: ROUTE_NAMES.SHOPPING_LIST,
        params: { id: weekId },
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('handles onError with axios error that is NOT 409', () => {
      const config = createShoppingListMutation() as any;
      const error = { response: { status: 500 }, isAxiosError: true };

      config.onError(error, weekId);

      expect(toast.error).toHaveBeenCalled();
    });

    it('handles onError with axios error without response', () => {
      const config = createShoppingListMutation() as any;
      const error = { isAxiosError: true };

      config.onError(error, weekId);

      expect(toast.error).toHaveBeenCalled();
    });

    it('handles onError with other errors', () => {
      const config = createShoppingListMutation() as any;
      const error = new Error('Random error');

      config.onError(error, weekId);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('An error occurred during creating ShoppingList'),
      );
    });
  });

  describe('updateShoppingListMutation', () => {
    const updatedItems = [{ name: 'Apples', amount: 10, unit: 'pcs' as const, checked: true }];
    const updatePayload = { week_id: weekId, items: updatedItems };

    it('puts updated shopping list', async () => {
      mockApi
        .onPut(`/weeks/${weekId}/shopping-list`, { items: updatedItems })
        .reply(200, updatePayload);

      const config = updateShoppingListMutation() as any;
      const result = await config.mutation(updatePayload as any);
      expect(result).toEqual(updatePayload);
    });

    it('handles onMutate for optimistic update', () => {
      mockCache.getQueryData.mockReturnValue(mockShoppingList);
      const config = updateShoppingListMutation() as any;
      const context = config.onMutate(updatePayload as any);

      expect(mockCache.cancelQueries).toHaveBeenCalledWith({
        key: WEEK_KEYS.shopping_list(weekId),
      });
      expect(mockCache.setQueryData).toHaveBeenCalledWith(WEEK_KEYS.shopping_list(weekId), {
        ...mockShoppingList,
        week_id: weekId,
        items: updatedItems,
      });
      expect(context).toEqual({ previous: mockShoppingList });
    });

    it('handles onMutate when no previous data exists', () => {
      mockCache.getQueryData.mockReturnValue(undefined);
      const config = updateShoppingListMutation() as any;
      const context = config.onMutate(updatePayload as any);

      expect(context).toEqual({ previous: null });
    });

    it('handles onSuccess', () => {
      const config = updateShoppingListMutation() as any;
      config.onSuccess(updatePayload, updatePayload as any);

      expect(mockCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.shopping_list(weekId),
        updatePayload,
      );
    });

    it('handles onError by reverting to previous data', () => {
      const config = updateShoppingListMutation() as any;
      const error = new Error('Update failed');
      const context = { previous: mockShoppingList };

      config.onError(error, updatePayload as any, context as any);

      expect(toast.error).toHaveBeenCalled();
      expect(mockCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.shopping_list(weekId),
        mockShoppingList,
      );
    });

    it('handles onError with no previous data', () => {
      const config = updateShoppingListMutation() as any;
      const error = new Error('Update failed');

      config.onError(error, updatePayload as any, {});

      expect(toast.error).toHaveBeenCalled();
      expect(mockCache.setQueryData).not.toHaveBeenCalled();
    });
  });

  describe('deleteShoppingListMutation', () => {
    it('deletes the shopping list', async () => {
      mockApi.onDelete(`/weeks/${weekId}/shopping-list`).reply(204);

      const config = deleteShoppingListMutation() as any;
      const result = await config.mutation(weekId);
      expect(result).toBeUndefined();
    });

    it('handles onMutate', () => {
      mockCache.getQueryData.mockReturnValue(mockShoppingList);
      const config = deleteShoppingListMutation() as any;
      const context = config.onMutate(weekId);

      expect(mockCache.cancelQueries).toHaveBeenCalledWith({
        key: WEEK_KEYS.shopping_list(weekId),
      });
      expect(mockCache.setQueryData).toHaveBeenCalledWith(WEEK_KEYS.shopping_list(weekId), null);
      expect(context).toEqual({ previous: mockShoppingList });
    });

    it('handles onMutate when no previous data exists', () => {
      mockCache.getQueryData.mockReturnValue(undefined);
      const config = deleteShoppingListMutation() as any;
      const context = config.onMutate(weekId);

      expect(context).toEqual({ previous: null });
    });

    it('handles onSuccess', () => {
      const config = deleteShoppingListMutation() as any;
      config.onSuccess(undefined, weekId);

      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('groceries list was removed successfully'),
      );
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: ROUTE_NAMES.WEEK,
        params: { id: weekId },
      });
    });

    it('handles onError by reverting to previous data', () => {
      const config = deleteShoppingListMutation() as any;
      const error = new Error('Delete failed');
      const context = { previous: mockShoppingList };

      config.onError(error, weekId, context as any);

      expect(toast.error).toHaveBeenCalled();
      expect(mockCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.shopping_list(weekId),
        mockShoppingList,
      );
    });

    it('handles onError with no previous data', () => {
      const config = deleteShoppingListMutation() as any;
      const error = new Error('Delete failed');

      config.onError(error, weekId, {});

      expect(toast.error).toHaveBeenCalled();
      expect(mockCache.setQueryData).not.toHaveBeenCalled();
    });
  });
});
