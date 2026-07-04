import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type { Ingredient } from './recipes';
import { WEEK_KEYS } from './weeks';
import { apiClient } from './client';
import { toast } from 'vue-sonner';
import axios from 'axios';

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
  const queryCache = useQueryCache();

  return {
    mutate: (weekId: string) =>
      apiClient.post<ShoppingList>(`/weeks/${weekId}/shopping-list`).then((res) => res.data),
    onMutate: (weekId: string) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.shopping_list(weekId) });
    },
    onSuccess: (shoppingList: ShoppingList, weekId: string, _context?: {}) => {
      queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), shoppingList);
    },
    onError: (err: Error, weekId: string, _context?: {}) =>
      toast.error(`An error occured during creating ShoppinList for week ${weekId} -- ${err}`),
  };
});

/**
 *
 */
export const updateShoppingListMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutate: ({ week_id: weekId, items }: ShoppingList) =>
      apiClient.put<ShoppingList>(`/weeks/${weekId}/shopping-list`, items).then((res) => res.data),
    onMutate: ({ week_id: weekId, items }: ShoppingList) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.shopping_list(weekId) });
      const previous =
        queryCache.getQueryData<ShoppingList>(WEEK_KEYS.shopping_list(weekId)) || null;
      queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), { ...previous, items });
      return { previous };
    },
    onSuccess: (
      shoppingList: ShoppingList,
      { week_id: weekId }: ShoppingList,
      _context?: { previous?: ShoppingList | null },
    ) => {
      toast.success('ShoppingList has been successfully updated');
      queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), shoppingList);
    },
    onError: (
      err: Error,
      { week_id: weekId }: ShoppingList,
      context?: { previous?: ShoppingList | null },
    ) => {
      toast.error(`An error occured during creating ShoppinList for week ${weekId} -- ${err}`);
      if (context?.previous)
        queryCache.setQueryData(WEEK_KEYS.shopping_list(weekId), context.previous);
    },
    onSettled: (
      _err: Error | undefined,
      _shoppingList: ShoppingList,
      { week_id: weekId }: ShoppingList,
      _context?: { previous?: ShoppingList | null },
    ) => {
      queryCache.invalidateQueries({ key: WEEK_KEYS.shopping_list(weekId) });
    },
  };
});
