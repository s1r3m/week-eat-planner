import { defineMutation, useQueryCache } from '@pinia/colada';
import { apiClient } from '@/api/client';
import type { RecipePreview } from '@/api/recipes';
import { WEEK_KEYS } from '@/api/weeks';
import type { WeekFull, DayOfWeek, MealType, WeekDay } from '@/api/weeks';

export interface MealSlotPreview {
  day_of_week: DayOfWeek;
  meal_type: MealType;
  recipe: RecipePreview | null;
}

export interface MealSlotUpdate {
  slot_id: string;
  recipe_id: string | null;
}

export interface MealSlotVars {
  weekId: string;
  slots: MealSlotUpdate[];
}

export const assignRecipeMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: ({ weekId, slots }: MealSlotVars) =>
      apiClient.patch<MealSlotPreview[]>(`/weeks/${weekId}/slots`, slots).then((res) => res.data),
    onMutate: ({ weekId, slots }: MealSlotVars) => {
      queryCache.cancelQueries({ key: WEEK_KEYS.detail(weekId) });
      const week = queryCache.getQueryData<WeekFull>(WEEK_KEYS.detail(weekId));

      if (week) {
        const updatedWeek: WeekFull = {
          ...week,
          week_days: week.week_days.map((day) => ({
            ...day,
            slots: day.slots.map((slot) => {
              const update = slots.find((ms) => ms.slot_id === slot.id);
              return update
                ? { ...slot, recipe: { id: update.recipe_id, name: 'TBU' } as RecipePreview }
                : slot;
            }),
          })),
        };
      }
      slots.forEach((slotUpdate) => {
        week?.week_days.forEach(({ slots }: WeekDay) => {
          slots.map((slot) =>
            slot.id === slotUpdate.slot_id
              ? { ...slot, recipe: { id: slotUpdate.recipe_id, name: 'TBU' } }
              : slot,
          );
        });
      });
      return { week };
    },
    onError: (err: Error, { weekId }: MealSlotVars, context?: { week?: WeekFull }) => {
      console.error('An error occurred during assigning: ', err);
      if (context) queryCache.setQueryData(WEEK_KEYS.detail(weekId), context.week);
    },
    onSuccess: (res: MealSlotPreview[], _vars: MealSlotVars, _context?: { week?: WeekFull }) => {
      res.forEach((slot) => {
        console.log(
          `Successfully assigned the recipe ${slot.recipe} to slot ${slot.meal_type} of ${slot.day_of_week}`,
        );
      });
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
