import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignRecipeMutation } from '../mealSlots';
import { apiClient } from '../client';
import { useQueryCache } from '@pinia/colada';
import { WEEK_KEYS } from '../weeks';
import type { WeekFull } from '../weeks';

vi.mock('@pinia/colada', () => ({
  defineMutation: (fn: any) => fn,
  defineQueryOptions: (fn: any) => fn,
  useQueryCache: vi.fn(),
}));

vi.mock('../client', () => ({
  apiClient: { patch: vi.fn() },
}));

describe('assignRecipeMutation', () => {
  const mockQueryCache = {
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryCache).mockReturnValue(mockQueryCache as any);
  });

  describe('mutation', () => {
    it('PATCHes the slots endpoint with recipe_id extracted from each slot', async () => {
      const vars = {
        weekId: 'week-1',
        slots: [{ slot_id: 'slot-1', recipe: { id: 'recipe-1' } as any }],
      };
      const mockData = [
        { day_of_week: 'MONDAY', meal_type: 'LUNCH', recipe: vars.slots[0].recipe },
      ];
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockData } as any);

      const config = assignRecipeMutation() as any;
      const result = await config.mutation(vars);

      expect(apiClient.patch).toHaveBeenCalledWith('/weeks/week-1/slots', [
        { slot_id: 'slot-1', recipe_id: 'recipe-1' },
      ]);
      expect(result).toEqual(mockData);
    });

    it('sends recipe_id as null when recipe is null', async () => {
      const vars = { weekId: 'week-1', slots: [{ slot_id: 'slot-1', recipe: null }] };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: [] } as any);

      const config = assignRecipeMutation() as any;
      await config.mutation(vars);

      expect(apiClient.patch).toHaveBeenCalledWith('/weeks/week-1/slots', [
        { slot_id: 'slot-1', recipe_id: null },
      ]);
    });
  });

  describe('onMutate', () => {
    it('optimistically updates matching slots in the week cache', () => {
      const fullRecipe = {
        id: 'recipe-1',
        name: 'Pasta',
        author: 'me',
        is_favorite: false,
        image_url: null,
      };
      const vars = { weekId: 'week-1', slots: [{ slot_id: 'slot-1', recipe: fullRecipe }] };
      const week: WeekFull = {
        id: 'week-1',
        name: 'Week 1',
        user_id: 'u',
        week_days: [
          {
            name: 'MONDAY',
            slots: [{ id: 'slot-1', meal_type: 'LUNCH', day_of_week: 'MONDAY', recipe: null }],
          },
        ],
      };
      mockQueryCache.getQueryData.mockReturnValue(week);

      const config = assignRecipeMutation() as any;
      config.onMutate(vars);

      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.detail('week-1'),
        expect.objectContaining({
          week_days: expect.arrayContaining([
            expect.objectContaining({
              slots: expect.arrayContaining([
                expect.objectContaining({ id: 'slot-1', recipe: fullRecipe }),
              ]),
            }),
          ]),
        }),
      );
    });

    it('leaves unmentioned slots unchanged', () => {
      const vars = { weekId: 'week-1', slots: [{ slot_id: 'slot-2', recipe: null }] };
      const week: WeekFull = {
        id: 'week-1',
        name: 'Week 1',
        user_id: 'u',
        week_days: [
          {
            name: 'MONDAY',
            slots: [
              {
                id: 'slot-1',
                meal_type: 'LUNCH',
                day_of_week: 'MONDAY',
                recipe: { id: 'r1', name: 'R', author: 'me', is_favorite: false, image_url: null },
              },
            ],
          },
        ],
      };
      mockQueryCache.getQueryData.mockReturnValue(week);

      const config = assignRecipeMutation() as any;
      config.onMutate(vars);

      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.detail('week-1'),
        expect.objectContaining({
          week_days: expect.arrayContaining([
            expect.objectContaining({
              slots: expect.arrayContaining([
                expect.objectContaining({
                  id: 'slot-1',
                  recipe: {
                    id: 'r1',
                    name: 'R',
                    author: 'me',
                    is_favorite: false,
                    image_url: null,
                  },
                }),
              ]),
            }),
          ]),
        }),
      );
    });

    it('does nothing when the week is not in cache', () => {
      mockQueryCache.getQueryData.mockReturnValue(null);

      const config = assignRecipeMutation() as any;
      config.onMutate({ weekId: 'week-1', slots: [] });

      expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
    });
  });

  describe('onError', () => {
    it('rolls back the week cache to the previous state', () => {
      const previousWeek = { id: 'week-1' } as WeekFull;
      const vars = { weekId: 'week-1', slots: [] };

      const config = assignRecipeMutation() as any;
      config.onError(new Error('fail'), vars, { week: previousWeek });

      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        WEEK_KEYS.detail('week-1'),
        previousWeek,
      );
    });

    it('does nothing when context or week is missing', () => {
      const vars = { weekId: 'week-1', slots: [] };
      const config = assignRecipeMutation() as any;

      config.onError(new Error('fail'), vars, undefined);
      config.onError(new Error('fail'), vars, {});

      expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
    });
  });

  describe('onSettled', () => {
    it('invalidates the week detail cache', () => {
      const config = assignRecipeMutation() as any;
      config.onSettled(undefined, undefined, { weekId: 'week-1', slots: [] }, undefined);

      expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
        key: WEEK_KEYS.detail('week-1'),
      });
    });
  });
});
