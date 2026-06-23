import { defineQueryOptions, defineMutation, useQueryCache } from '@pinia/colada';
import { apiClient } from './client';
import type { RecipePreview } from './recipes';
import { toast } from 'vue-sonner';

/**
 * Days of the week used for meal planning.
 */
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

/**
 * Types of meals that can be planned in a slot.
 */
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

/**
 * Represents a day in a week's meal plan, containing multiple meal slots.
 */
export interface WeekDay {
  name: DayOfWeek;
  slots: MealSlot[];
}

/**
 * A specific slot in a meal plan for a given day and meal type.
 */
export interface MealSlot {
  id: string;
  meal_type: MealType;
  day_of_week: DayOfWeek;
  recipe: RecipePreview | null;
}

/**
 * Minimal week information used for lists.
 */
export interface WeekPreview {
  id: string;
  name: string;
  user_id: string;
}

/**
 * Detailed representation of a week's meal plan.
 */
export interface WeekFull extends WeekPreview {
  week_days: WeekDay[];
}

/**
 * Payload for creating a new week.
 */
export interface WeekPayload {
  name: string;
}

/**
 * Parameters for editing an existing week.
 */
export interface EditWeekVars {
  id: string;
  payload: WeekPayload;
}

/**
 * Cache keys for week-related queries.
 */
export const WEEK_KEYS = {
  /** Base key for all weeks. */
  root: ['weeks'] as const,
  /**
   * Key for the list of all weeks.
   * @returns Hierarchical cache key.
   */
  all: () => [...WEEK_KEYS.root, 'list'] as const,
  /**
   * Key for a specific week detail.
   * @param id - The unique identifier of the week.
   * @returns Hierarchical cache key.
   */
  detail: (id: string) => [...WEEK_KEYS.root, 'detail', id] as const,
};

/**
 * Query options for fetching the list of all planned weeks for the current user.
 *
 * @returns Colada query options for the weeks list.
 */
export const getWeeksQuery = defineQueryOptions(() => ({
  key: WEEK_KEYS.all(),
  query: () => apiClient.get<WeekPreview[]>('/weeks').then((res) => res.data),
}));

/**
 * Query options for fetching the full details of a specific week, including all days and meal slots.
 *
 * @param id - The unique identifier of the week.
 * @returns Colada query options for a specific week's details.
 */
export const getWeekQuery = defineQueryOptions((id: string) => ({
  key: WEEK_KEYS.detail(id),
  query: () => apiClient.get<WeekFull>(`/weeks/${id}`).then((res) => res.data),
}));

/**
 * Mutation for creating a new empty week.
 * Optimistically adds a pending week item to the list with a temporary ID.
 */
export const addWeekMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: (payload: WeekPayload) =>
      apiClient.post<WeekPreview>('/weeks', payload).then((res) => res.data),
    onMutate: (payload: WeekPayload) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.all() });
      const previousWeeks = queryCache.getQueryData<WeekPreview[]>(WEEK_KEYS.all()) || [];
      queryCache.setQueryData(WEEK_KEYS.all(), (old: WeekPreview[] = []) => [
        ...old,
        { id: `temp-id-${Date.now()}`, user_id: 'temp-obj', ...payload, isPending: true },
      ]);
      return { previousWeeks };
    },
    onError: (err: Error, payload: WeekPayload, context: { previousWeeks?: WeekPreview[] }) => {
      toast.error(`An error occurred while creating new week ${payload.name}: ${err.message}`);
      if (context?.previousWeeks) queryCache.setQueryData(WEEK_KEYS.all(), context.previousWeeks);
    },
    onSuccess: (week: WeekPreview) => toast.success(`Week ${week.name} created successfully`),
    onSettled: () => queryCache.invalidateQueries({ key: WEEK_KEYS.all() }),
  };
});

/**
 * Mutation for updating week details such as its name.
 * Handles optimistic updates for both the list view and the detail view.
 */
export const editWeekMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: ({ id, payload }: EditWeekVars) =>
      apiClient.patch(`/weeks/${id}`, payload).then((res) => res.data),
    onMutate: (vars: EditWeekVars) => {
      // TODO: Remove all weeks cache.
      queryCache.cancelQueries({ key: WEEK_KEYS.detail(vars.id) });
      queryCache.cancelQueries({ key: WEEK_KEYS.all() });
      const previous = queryCache.getQueryData<WeekFull>(WEEK_KEYS.detail(vars.id));
      const previousWeeks = queryCache.getQueryData<WeekPreview[]>(WEEK_KEYS.all()) || [];
      queryCache.setQueryData(WEEK_KEYS.detail(vars.id), { ...previous, ...vars.payload });
      queryCache.setQueryData(WEEK_KEYS.all(), (old: WeekPreview[] = []) =>
        old.map((week) => (week.id === vars.id ? { ...week, ...vars.payload } : week)),
      );
      return { previous, previousWeeks };
    },
    onError: (
      err: Error,
      { id }: EditWeekVars,
      context: { previous?: WeekFull; previousWeeks?: WeekPreview[] },
    ) => {
      if (context?.previous) queryCache.setQueryData(WEEK_KEYS.detail(id), context.previous);
      if (context?.previousWeeks) queryCache.setQueryData(WEEK_KEYS.all(), context.previousWeeks);
      toast.error(`Failed to update week: ${err.message}`);
    },
    onSuccess: (week: WeekPreview) => toast.success(`Week ${week.name} updated successfully`),
    onSettled: (
      _updatedWeek: WeekPreview,
      _error: Error | undefined,
      { id }: EditWeekVars,
      _context: { previous?: WeekFull; previousWeeks?: WeekPreview[] },
    ) => {
      queryCache.invalidateQueries({ key: WEEK_KEYS.all() });
      queryCache.invalidateQueries({ key: WEEK_KEYS.detail(id) });
    },
  };
});

/**
 * Mutation for deleting a week.
 * Performs optimistic updates by filtering out the deleted week from the local cache.
 */
export const deleteWeekMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: (id: string) => apiClient.delete<void>(`/weeks/${id}`).then(() => undefined),
    onMutate: (id: string) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.all() });
      const previousWeeks = queryCache.getQueryData<WeekPreview[]>(WEEK_KEYS.all()) || [];
      queryCache.setQueryData(WEEK_KEYS.all(), (old: WeekPreview[] = []) =>
        old.filter((week: WeekPreview) => week.id !== id),
      );
      return { previousWeeks };
    },
    onError: (err: Error, id: string, context?: { previousWeeks?: WeekPreview[] }) => {
      if (context?.previousWeeks) queryCache.setQueryData(WEEK_KEYS.all(), context.previousWeeks);
    },
    onSettled: (
      _: undefined,
      _error: Error | undefined,
      id: string,
      _context: { previousWeeks?: WeekPreview[] },
    ) => {
      queryCache.invalidateQueries({ key: WEEK_KEYS.all() });
      queryCache.invalidateQueries({ key: WEEK_KEYS.detail(id) });
    },
  };
});
