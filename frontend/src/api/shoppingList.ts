import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type { Ingredient } from './recipes';
import { WEEK_KEYS } from './weeks';
import { apiClient } from './client';
import { toast } from 'vue-sonner';
import axios, { isAxiosError } from 'axios';
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

/**
 *
 */
export interface ShoppingListItem extends Ingredient {
  checked: boolean;
}

/**
 *
 */
export interface ShoppingListItems {
  items: ShoppingListItem[];
}

/**
 *
 */
export interface ShoppingList extends ShoppingListItems {
  week_id: string;
}

/**
 *
 */
export const getShoppingListQuery = defineQueryOptions((weekId: string) => ({
  key: WEEK_KEYS.shopping_list(weekId),
  query: async () =>
    apiClient.get<ShoppingList>(`/weeks/${weekId}/shopping-list`).then((res) => res.data),
}));

/**
 *
 */
export const createShoppingListMutation = defineMutation(() => {
  const router = useRouter();
  const queryCache = useQueryCache();

  return {
    mutation: (weekId: string) =>
      apiClient.post<ShoppingList>(`/weeks/${weekId}/shopping-list`).then((res) => res.data),
    onMutate: (weekId: string) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.shopping_list(weekId) });
    },
    onSuccess: (shoppingList: ShoppingList, weekId: string, _context?: {}) => {
      queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), shoppingList);
      router.push({ name: ROUTE_NAMES.SHOPPING_LIST, params: { id: weekId } });
    },
    onError: (err: Error, weekId: string, _context?: {}) => {
      if (isAxiosError(err) && err.response?.status == 409) {
        router.push({ name: ROUTE_NAMES.SHOPPING_LIST, params: { id: weekId } });
        return;
      }
      toast.error(`An error occurred during creating ShoppingList for week ${weekId} -- ${err}`);
    },
  };
});

/**
 *
 */
export const updateShoppingListMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: ({ week_id: weekId, items }: ShoppingList) =>
      apiClient
        .put<ShoppingList>(`/weeks/${weekId}/shopping-list`, { items })
        .then((res) => res.data),
    onMutate: ({ week_id: weekId, items }: ShoppingList) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.shopping_list(weekId) });
      const previous =
        queryCache.getQueryData<ShoppingList>(WEEK_KEYS.shopping_list(weekId)) || null;
      queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), {
        ...previous,
        week_id: weekId,
        items,
      });
      return { previous };
    },
    onSuccess: (
      shoppingList: ShoppingList,
      { week_id: weekId }: ShoppingList,
      _context?: { previous?: ShoppingList | null },
    ) => {
      queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), shoppingList);
    },
    onError: (
      err: Error,
      { week_id: weekId }: ShoppingList,
      context?: { previous?: ShoppingList | null },
    ) => {
      toast.error(`An error occurred during updating ShoppingList for week ${weekId} -- ${err}`);
      if (context?.previous)
        queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), context.previous);
    },
  };
});

/**
 *
 */
export const deleteShoppingListMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  const router = useRouter();

  return {
    mutation: (weekId: string) =>
      apiClient.delete<null>(`/weeks/${weekId}/shopping-list`).then(() => undefined),
    onMutate: (weekId: string) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.shopping_list(weekId) });
      const previous =
        queryCache.getQueryData<ShoppingList>(WEEK_KEYS.shopping_list(weekId)) || null;
      queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), null);
      return { previous };
    },
    onSuccess: (
      _response: undefined,
      weekId: string,
      _context?: { previous?: ShoppingList | null },
    ) => {
      toast.success('The groceries list was removed successfully');
      router.push({ name: ROUTE_NAMES.WEEK, params: { id: weekId } });
    },
    onError: (err: Error, weekId: string, context?: { previous?: ShoppingList | null }) => {
      toast.error(`An error occurred during deleting ShoppingList for week ${weekId} -- ${err}`);
      if (context?.previous)
        queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), context.previous);
    },
  };
});
