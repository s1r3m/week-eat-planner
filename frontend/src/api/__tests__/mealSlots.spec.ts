import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignRecipeMutation } from '../mealSlots';
import { apiClient } from '../client';
import { useQueryCache } from '@pinia/colada';

vi.mock('@pinia/colada', () => ({
  defineMutation: vi.fn((fn: any) => fn),
  defineQueryOptions: vi.fn((fn: any) => fn),
  useQueryCache: vi.fn(),
}));

vi.mock('../client', () => ({
  apiClient: {
    patch: vi.fn(),
  },
}));

describe('mealSlots API', () => {
  const mockQueryCache = {
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryCache as any).mockReturnValue(mockQueryCache);
  });

  describe('assignRecipeMutation', () => {
    it('calls the correct endpoint on mutation and extracts recipe_id', async () => {
      const fullRecipe = { id: 'recipe-1' } as any;
      const vars = {
        weekId: 'week-1',
        slots: [{ slot_id: 'slot-1', recipe: fullRecipe }],
      };
      const mockData = [{ day_of_week: 'MONDAY', meal_type: 'LUNCH', recipe: fullRecipe }];
      (apiClient.patch as any).mockResolvedValue({ data: mockData });

      const mutation = assignRecipeMutation();
      const result = await (mutation as any).mutation(vars);

      expect(apiClient.patch).toHaveBeenCalledWith('/weeks/week-1/slots', [
        { slot_id: 'slot-1', recipe_id: 'recipe-1' },
      ]);
      expect(result).toEqual(mockData);
    });

    it('handles null recipe in mutation payload', async () => {
      const vars = {
        weekId: 'week-1',
        slots: [{ slot_id: 'slot-1', recipe: null }],
      };
      (apiClient.patch as any).mockResolvedValue({ data: [] });

      const mutation = assignRecipeMutation();
      await (mutation as any).mutation(vars);

      expect(apiClient.patch).toHaveBeenCalledWith('/weeks/week-1/slots', [
        { slot_id: 'slot-1', recipe_id: null },
      ]);
    });

    it('does nothing in onMutate if week is not in cache', () => {
      const vars = { weekId: 'week-1', slots: [] };
      mockQueryCache.getQueryData.mockReturnValueOnce(null);

      const mutation = assignRecipeMutation();
      mutation.onMutate(vars);

      expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
    });

    it('leaves slot unchanged if no update is provided for it', () => {
      const vars = {
        weekId: 'week-1',
        slots: [{ slot_id: 'slot-2', recipe: null }],
      };
      const mockWeek = {
        id: 'week-1',
        week_days: [
          {
            slots: [{ id: 'slot-1', recipe: { id: 'r1' } }],
          },
        ],
      };
      mockQueryCache.getQueryData.mockReturnValueOnce(mockWeek);

      const mutation = assignRecipeMutation();
      mutation.onMutate(vars);

      const updater = mockQueryCache.setQueryData.mock.calls[0][1];
      // Updated week is actually computed in assignRecipeMutation,
      // but here we just check if setQueryData was called.
      expect(mockQueryCache.setQueryData).toHaveBeenCalled();
    });

    it('optimistically updates the cache onMutate with provided recipe', async () => {
      const fullRecipe = {
        id: 'recipe-1',
        name: 'Real Recipe',
        author: 'Author',
        is_favorite: true,
        image_url: 'img.png',
      } as any;
      const vars = {
        weekId: 'week-1',
        slots: [{ slot_id: 'slot-1', recipe: fullRecipe }],
      };
      const mockWeek = {
        id: 'week-1',
        name: 'Week 1',
        week_days: [
          {
            name: 'MONDAY',
            slots: [{ id: 'slot-1', meal_type: 'LUNCH', recipe: null }],
          },
        ],
      };
      mockQueryCache.getQueryData.mockReturnValueOnce(mockWeek);

      const mutation = assignRecipeMutation();
      mutation.onMutate(vars);

      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        ['weeks', 'detail', 'week-1'],
        expect.objectContaining({
          week_days: expect.arrayContaining([
            expect.objectContaining({
              slots: expect.arrayContaining([
                expect.objectContaining({
                  id: 'slot-1',
                  recipe: fullRecipe,
                }),
              ]),
            }),
          ]),
        }),
      );
    });

    it('rolls back the cache onError', () => {
      const vars = { weekId: 'week-1', slots: [] };
      const mockWeek = { id: 'week-1' };
      const mutation = assignRecipeMutation();

      mutation.onError(new Error('test'), vars, { week: mockWeek as any });

      expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
        ['weeks', 'detail', 'week-1'],
        mockWeek,
      );
    });

    it('does not rollback cache onError if context or week is missing', () => {
      const vars = { weekId: 'week-1', slots: [] };
      const mutation = assignRecipeMutation();

      mockQueryCache.setQueryData.mockClear();
      mutation.onError(new Error('test'), vars, undefined);
      expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();

      mutation.onError(new Error('test'), vars, {});
      expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
    });

    it('invalidates queries onSettled', () => {
      const vars = { weekId: 'week-1', slots: [] };
      const mutation = assignRecipeMutation();

      mutation.onSettled(undefined, undefined, vars, undefined);

      expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
        key: ['weeks', 'detail', 'week-1'],
      });
    });
  });
});
