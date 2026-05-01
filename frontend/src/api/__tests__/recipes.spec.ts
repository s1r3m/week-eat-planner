import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { createPinia, setActivePinia } from 'pinia';
import { useQueryCache } from '@pinia/colada';
import { apiClient } from '../client';
import {
  getMyRecipesQuery,
  getRecipeQuery,
  RECIPE_KEYS,
  addRecipeMutation,
  addImageMutation,
  deleteRecipeMutation,
  toggleFavoriteMutation,
  getFavoritesQuery,
} from '../recipes';
import { toast } from 'vue-sonner';

vi.mock('@pinia/colada', () => ({
  defineQueryOptions: (fn: any) => fn,
  defineMutation: (fn: any) => fn,
  useQueryCache: vi.fn(),
}));

vi.mock('vue-sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe('recipes api', () => {
  let mockApi: MockAdapter;
  let mockQueryCache: ReturnType<typeof useQueryCache>;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = new MockAdapter(apiClient);
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    mockQueryCache = {
      cancelQueries: vi.fn(),
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    } as any;
    vi.mocked(useQueryCache).mockReturnValue(mockQueryCache);
  });

  describe('getMyRecipesQuery', () => {
    it('uses the correct cache key', () => {
      const options = getMyRecipesQuery() as any;
      expect(options.key).toEqual(RECIPE_KEYS.my());
    });

    it('fetches the list of my recipes', async () => {
      const mockData = [{ id: '1', name: 'Recipe 1' }];
      mockApi.onGet('/recipes/my_recipes').reply(200, mockData);

      const options = getMyRecipesQuery() as any;
      const result = await options.query();
      expect(result).toEqual(mockData);
    });
  });

  describe('getRecipeQuery', () => {
    it('uses a key scoped to the recipe id', () => {
      const id = 'recipe-123';
      const options = getRecipeQuery(id) as any;
      expect(options.key).toEqual(RECIPE_KEYS.detail(id));
    });

    it('fetches a single recipe by id', async () => {
      const id = '1';
      const mockData = { id: '1', name: 'Recipe 1', description: 'Test' };
      mockApi.onGet(`/recipes/${id}`).reply(200, mockData);

      const options = getRecipeQuery(id) as any;
      const result = await options.query();
      expect(result).toEqual(mockData);
    });
  });

  describe('addRecipeMutation', () => {
    const payload = { name: 'New Recipe', steps: [], ingredients: [], is_public: true };

    it('posts the recipe and returns the created item', async () => {
      const mockData = { id: 'new-1', ...payload };
      mockApi.onPost('/recipes').reply(201, mockData);

      const config = addRecipeMutation() as any;
      const result = await config.mutation(payload);
      expect(result).toEqual(mockData);
    });

    describe('onMutate', () => {
      it('cancels in-flight queries and optimistically appends the new recipe', () => {
        const previousRecipes = [{ id: '1', name: 'Existing' }];
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(previousRecipes);

        const config = addRecipeMutation() as any;
        const context = config.onMutate(payload);

        expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
        expect(context).toEqual({ previousRecipes });

        const updater = vi.mocked(mockQueryCache.setQueryData).mock.calls[0][1] as Function;
        const updated = updater(previousRecipes);
        expect(updated).toHaveLength(2);
        expect(updated[1]).toMatchObject({ ...payload, author: 'me' });
        expect(updated[1].id).toMatch(/^temp-id-/);
      });

      it('treats missing cache as an empty list', () => {
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(null);

        const config = addRecipeMutation() as any;
        const context = config.onMutate(payload);

        expect(context.previousRecipes).toEqual([]);
        const updater = vi.mocked(mockQueryCache.setQueryData).mock.calls[0][1] as Function;
        expect(updater(undefined)).toHaveLength(1);
      });
    });

    describe('onSuccess', () => {
      it('shows a success toast with the recipe name', () => {
        const created = {
          id: 'new-1',
          name: 'My Recipe',
          author: 'me',
          is_favorite: false,
          image_url: null,
        };

        const config = addRecipeMutation() as any;
        config.onSuccess(created, payload, {});

        expect(toast.success).toHaveBeenCalledWith('Recipe My Recipe created successfully');
      });
    });

    describe('onError', () => {
      it('shows an error toast and restores the previous cache', () => {
        const context = {
          previousRecipes: [
            { id: '1', name: 'Existing', author: 'me', is_favorite: false, image_url: null },
          ],
        };

        const config = addRecipeMutation() as any;
        config.onError(new Error('network'), payload, context);

        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('New Recipe'));
        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
          RECIPE_KEYS.my(),
          context.previousRecipes,
        );
      });

      it('does nothing to the cache when context is missing', () => {
        const config = addRecipeMutation() as any;
        config.onError(new Error('network'), payload, undefined);

        expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
      });
    });

    describe('onSettled', () => {
      it('invalidates the my-recipes list', () => {
        const config = addRecipeMutation() as any;
        config.onSettled();
        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
      });
    });
  });

  describe('addImageMutation', () => {
    it('patches the recipe image and returns the updated recipe', async () => {
      const payload = { id: '1', image: new File([''], 'test.jpg', { type: 'image/jpeg' }) };
      const mockData = { id: '1', image_url: 'http://test.jpg' };
      mockApi.onPatch('/recipes/1/image').reply(200, mockData);

      const config = addImageMutation() as any;
      const result = await config.mutation(payload);
      expect(result).toEqual(mockData);
    });

    describe('onSuccess', () => {
      it('merges updated image data into the my-recipes cache', () => {
        const existing = {
          id: '1',
          name: 'Recipe',
          author: 'me',
          is_favorite: false,
          image_url: null,
        };
        const updated = {
          id: '1',
          name: 'Recipe',
          author: 'me',
          is_favorite: false,
          image_url: 'http://new.jpg',
        };

        const config = addImageMutation() as any;
        config.onSuccess(updated);

        const updater = vi.mocked(mockQueryCache.setQueryData).mock.calls[0][1] as Function;
        expect(updater([existing])).toEqual([updated]);
        expect(updater([{ id: '2', name: 'Other' }])).toEqual([{ id: '2', name: 'Other' }]);
        expect(updater(undefined)).toEqual([]);
      });
    });

    describe('onError', () => {
      it('shows an error toast with the failure reason', () => {
        const config = addImageMutation() as any;
        config.onError(new Error('upload failed'), { id: '1', image: {} as File });

        expect(toast.error).toHaveBeenCalledWith('Upload has failed: upload failed');
      });
    });

    describe('onSettled', () => {
      it('invalidates the my-recipes list', () => {
        const config = addImageMutation() as any;
        config.onSettled();
        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
      });
    });
  });

  describe('deleteRecipeMutation', () => {
    const id = '1';

    it('sends DELETE /recipes/:id', async () => {
      mockApi.onDelete(`/recipes/${id}`).reply(204, null);

      const config = deleteRecipeMutation() as any;
      const result = await config.mutation(id);
      expect(result).toBeUndefined();
    });

    describe('onMutate', () => {
      it('optimistically removes the recipe from the list', () => {
        const previousRecipes = [
          { id: '1', name: 'Recipe' },
          { id: '2', name: 'Other' },
        ];
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(previousRecipes);

        const config = deleteRecipeMutation() as any;
        const context = config.onMutate(id);

        expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
        expect(context).toEqual({ previousRecipes });

        const updater = vi.mocked(mockQueryCache.setQueryData).mock.calls[0][1] as Function;
        expect(updater(previousRecipes)).toEqual([{ id: '2', name: 'Other' }]);
      });

      it('treats missing cache as an empty list', () => {
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(null);

        const config = deleteRecipeMutation() as any;
        const context = config.onMutate(id);

        expect(context.previousRecipes).toEqual([]);
      });
    });

    describe('onSuccess', () => {
      it('shows a success toast', () => {
        const config = deleteRecipeMutation() as any;
        config.onSuccess();
        expect(toast.success).toHaveBeenCalledWith('Recipe was deleted successfully');
      });
    });

    describe('onError', () => {
      it('shows an error toast and restores the cache', () => {
        const context = { previousRecipes: [{ id: '1', name: 'Recipe' }] };

        const config = deleteRecipeMutation() as any;
        config.onError(new Error('fail'), id, context);

        expect(toast.error).toHaveBeenCalledWith('Failed to delete the recipe');
        expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
          RECIPE_KEYS.my(),
          context.previousRecipes,
        );
      });

      it('still shows the error toast when context is missing', () => {
        const config = deleteRecipeMutation() as any;
        config.onError(new Error('fail'), id, undefined);

        expect(toast.error).toHaveBeenCalledWith('Failed to delete the recipe');
        expect(mockQueryCache.setQueryData).not.toHaveBeenCalled();
      });
    });

    describe('onSettled', () => {
      it('invalidates both the list and the deleted recipe detail', () => {
        const config = deleteRecipeMutation() as any;
        config.onSettled(null, undefined, id, {});

        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
          key: RECIPE_KEYS.detail(id),
        });
      });
    });
  });

  describe('toggleFavoriteMutation', () => {
    it('POSTs to add favorite when is_favorite is false', async () => {
      const payload = { id: '1', is_favorite: false };
      const mockData = { id: '1', name: 'Recipe', is_favorite: true };
      mockApi.onPost('/recipes/1/favorite').reply(201, mockData);

      const config = toggleFavoriteMutation() as any;
      const result = await config.mutation(payload);
      expect(result).toEqual(mockData);
    });

    it('DELETEs to remove favorite when is_favorite is true', async () => {
      const payload = { id: '1', is_favorite: true };
      mockApi.onDelete('/recipes/1/favorite').reply(204);

      const config = toggleFavoriteMutation() as any;
      const result = await config.mutation(payload);
      expect(result).toEqual({ id: '1', is_favorite: false });
    });

    describe('onMutate', () => {
      it('optimistically flips is_favorite across detail, list, and favorites caches', async () => {
        const recipe = { id: '1', name: 'Recipe', is_favorite: false };
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue([recipe]);

        const config = toggleFavoriteMutation() as any;
        await config.onMutate({ id: '1', is_favorite: false });

        expect(mockQueryCache.cancelQueries).toHaveBeenCalledTimes(3);
        expect(mockQueryCache.setQueryData).toHaveBeenCalled();
      });

      it('flips is_favorite on all matching recipes in an array cache entry', async () => {
        const recipes = [
          { id: '1', name: 'Recipe', is_favorite: false },
          { id: '2', name: 'Other', is_favorite: false },
        ];
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(recipes);

        const config = toggleFavoriteMutation() as any;
        await config.onMutate({ id: '1', is_favorite: false });

        const updater = vi.mocked(mockQueryCache.setQueryData).mock.calls[0][1] as Function;
        const result = updater(recipes);
        expect(result[0]).toEqual({ ...recipes[0], is_favorite: true });
        expect(result[1]).toBe(recipes[1]);
      });

      it('flips is_favorite on a single-recipe (detail) cache entry', async () => {
        const recipe = { id: '1', name: 'Recipe', is_favorite: false };
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(recipe);

        const config = toggleFavoriteMutation() as any;
        await config.onMutate({ id: '1', is_favorite: false });

        const updater = vi.mocked(mockQueryCache.setQueryData).mock.calls[0][1] as Function;
        expect(updater(recipe)).toEqual({ ...recipe, is_favorite: true });
      });

      it('leaves a non-matching single-recipe cache entry unchanged', async () => {
        const recipe = { id: '2', name: 'Other', is_favorite: true };
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(recipe);

        const config = toggleFavoriteMutation() as any;
        await config.onMutate({ id: '1', is_favorite: true });

        const updater = vi.mocked(mockQueryCache.setQueryData).mock.calls[0][1] as Function;
        expect(updater(recipe)).toBe(recipe);
      });

      it('handles undefined cache entry in updateRecipe', async () => {
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(undefined);

        const config = toggleFavoriteMutation() as any;
        await config.onMutate({ id: '1', is_favorite: false });

        const updater = vi.mocked(mockQueryCache.setQueryData).mock.calls[0][1] as Function;
        expect(updater(undefined)).toBeUndefined();
      });

      it('filters recipe out of favorites cache when un-favoriting', async () => {
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue([{ id: '1' }, { id: '2' }]);

        const config = toggleFavoriteMutation() as any;
        await config.onMutate({ id: '1', is_favorite: true });

        const filterCalls = vi
          .mocked(mockQueryCache.setQueryData)
          .mock.calls.filter(
            (call: any[]) => JSON.stringify(call[0]) === JSON.stringify(RECIPE_KEYS.favorites()),
          );
        const filterUpdater = filterCalls[filterCalls.length - 1]?.[1] as Function;
        const filtered = filterUpdater([{ id: '1' }, { id: '2' }]);
        expect(filtered).toEqual([{ id: '2' }]);
      });

      it('handles empty favorites cache gracefully', async () => {
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue(null);

        const config = toggleFavoriteMutation() as any;
        await config.onMutate({ id: '1', is_favorite: true });

        const filterCalls = vi
          .mocked(mockQueryCache.setQueryData)
          .mock.calls.filter(
            (call: any[]) => JSON.stringify(call[0]) === JSON.stringify(RECIPE_KEYS.favorites()),
          );
        const filterUpdater = filterCalls[filterCalls.length - 1]?.[1] as Function;
        expect(filterUpdater(undefined)).toEqual([]);
      });
    });

    describe('onError', () => {
      it('restores all caches from the previous state map', async () => {
        vi.mocked(mockQueryCache.getQueryData).mockReturnValue([]);

        const config = toggleFavoriteMutation() as any;
        const { previousState } = await config.onMutate({ id: '1', is_favorite: false });

        vi.mocked(mockQueryCache.setQueryData).mockClear();
        config.onError(new Error('fail'), { id: '1', is_favorite: false }, { previousState });

        expect(mockQueryCache.setQueryData).toHaveBeenCalled();
      });
    });

    describe('onSuccess', () => {
      it('invalidates favorites cache when a recipe is marked as favorite', () => {
        const config = toggleFavoriteMutation() as any;
        config.onSuccess({}, { id: '1', is_favorite: false }, {});

        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
          key: RECIPE_KEYS.favorites(),
        });
      });

      it('does not invalidate favorites cache when a recipe is un-favorited', () => {
        const config = toggleFavoriteMutation() as any;
        config.onSuccess({}, { id: '1', is_favorite: true }, {});

        expect(mockQueryCache.invalidateQueries).not.toHaveBeenCalled();
      });
    });

    describe('onSettled', () => {
      it('invalidates the recipe detail cache', () => {
        const config = toggleFavoriteMutation() as any;
        config.onSettled(undefined, null, { id: '1' }, {});

        expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
          key: RECIPE_KEYS.detail('1'),
        });
      });
    });
  });

  describe('getFavoritesQuery', () => {
    it('fetches the list of favorite recipes', async () => {
      const mockData = [{ id: '1', name: 'Favorite Recipe' }];
      mockApi.onGet('/recipes/favorites').reply(200, mockData);

      const options = getFavoritesQuery() as any;
      const result = await options.query();
      expect(result).toEqual(mockData);
    });
  });
});
