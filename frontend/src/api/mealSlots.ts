import { defineMutation, useQueryCache } from '@pinia/colada';
import { apiClient } from '@/api/client';
import { type RecipePreview } from '@/api/recipes';
import { WEEK_KEYS } from '@/api/weeks';
import type { WeekFull, DayOfWeek, MealType } from '@/api/weeks';

/**
 * Snapshot of a meal slot returned by the API after an update.
 */
export interface MealSlotPreview {
  day_of_week: DayOfWeek;
  meal_type: MealType;
  recipe: RecipePreview | null;
}

/**
 * A single slot update pairing a slot ID with its new recipe (or null to clear it).
 */
export interface MealSlotUpdate {
  slot_id: string;
  recipe: RecipePreview | null;
}

/**
 * Variables required to assign or clear recipes across one or more slots in a week.
 */
export interface MealSlotVars {
  weekId: string;
  slots: MealSlotUpdate[];
}

/**
 * Mutation for assigning or clearing recipes in meal slots.
 * Optimistically updates the week detail cache and rolls back on error.
 */
export const assignRecipeMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: ({ weekId, slots }: MealSlotVars) => {
      const payload = slots.map(({ slot_id, recipe }) => ({
        slot_id,
        recipe_id: recipe?.id ?? null,
      }));
      return apiClient
        .patch<MealSlotPreview[]>(`/weeks/${weekId}/slots`, payload)
        .then((res) => res.data);
    },
    onMutate: ({ weekId, slots }: MealSlotVars) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.detail(weekId) });
      const week = queryCache.getQueryData<WeekFull>(WEEK_KEYS.detail(weekId));

      if (week) {
        const updatesBySlotId = new Map(slots.map((u) => [u.slot_id, u]));
        const updatedWeek: WeekFull = {
          ...week,
          week_days: week.week_days.map((day) => ({
            ...day,
            slots: day.slots.map((slot) => {
              const update = updatesBySlotId.get(slot.id);
              return update
                ? {
                    ...slot,
                    recipe: update.recipe,
                  }
                : slot;
            }),
          })),
        };
        queryCache.setQueryData(WEEK_KEYS.detail(weekId), updatedWeek);
      }
      return { week };
    },
    onError: (err: Error, { weekId }: MealSlotVars, context?: { week?: WeekFull }) => {
      if (context?.week) queryCache.setQueryData(WEEK_KEYS.detail(weekId), context.week);
    },
    onSettled: (
      _res: MealSlotPreview[] | undefined,
      _err: Error | undefined,
      { weekId }: MealSlotVars,
      _context?: { week?: WeekFull },
    ) => {
      queryCache.invalidateQueries({ key: WEEK_KEYS.detail(weekId) });
    },
  };
});
