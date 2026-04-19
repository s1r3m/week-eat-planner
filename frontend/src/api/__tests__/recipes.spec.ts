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

vi.mock('@pinia/colada', () => {
  return {
    defineQueryOptions: (fn: any) => fn,
    defineMutation: (fn: any) => fn,
    useQueryCache: vi.fn(),
  };
});

vi.mock('vue-sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('recipes api', () => {
  let mockApi: MockAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = new MockAdapter(apiClient);
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.mocked(useQueryCache).mockReturnValue({
      cancelQueries: vi.fn(),
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    } as any);
  });

  describe('getMyRecipesQuery', () => {
    it('should have correct key', () => {
      const options = getMyRecipesQuery();
      expect(options.key).toEqual(RECIPE_KEYS.my());
    });

    it('should fetch recipes', async () => {
      const mockData = [{ id: '1', name: 'Recipe 1' }];
      mockApi.onGet('/recipes/my_recipes').reply(200, mockData);

      const options = getMyRecipesQuery();
      // @ts-ignore
      const result = await options.query();

      expect(result).toEqual(mockData);
    });
  });

  describe('getRecipeQuery', () => {
    it('should have correct dynamic key', () => {
      const id = 'recipe-123';
      const options = getRecipeQuery(id);
      expect(options.key).toEqual(RECIPE_KEYS.detail(id));
    });

    it('should fetch a single recipe', async () => {
      const id = '1';
      const mockData = { id: '1', name: 'Recipe 1', description: 'Test' };
      mockApi.onGet(`/recipes/${id}`).reply(200, mockData);

      const options = getRecipeQuery(id);
      // @ts-ignore
      const result = await options.query();

      expect(result).toEqual(mockData);
    });
  });

  describe('addRecipeMutation', () => {
    it('should post a new recipe', async () => {
      const payload = {
        name: 'New Recipe',
        steps: [],
        ingredients: [],
        is_public: true,
      };
      const mockData = { id: 'new-1', ...payload };
      mockApi.onPost('/recipes').reply(201, mockData);

      const mutation = (addRecipeMutation() as any).mutation;
      const result = await mutation(payload);

      expect(result).toEqual(mockData);
    });

    it('should handle onMutate and onError', async () => {
      const payload = {
        name: 'New Recipe',
        steps: [],
        ingredients: [],
        is_public: true,
      };
      const queryCache = useQueryCache();
      const previousRecipes = [{ id: '1', name: 'Existing' }];
      (queryCache.getQueryData as any).mockReturnValue(previousRecipes);

      const onMutate = (addRecipeMutation() as any).onMutate;
      const context = onMutate(payload);

      expect(queryCache.cancelQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
      expect(queryCache.setQueryData).toHaveBeenCalledWith(RECIPE_KEYS.my(), expect.any(Function));

      // Test the updater function
      const updater = vi.mocked(queryCache.setQueryData).mock.calls[0][1] as Function;
      const result = updater(previousRecipes);
      expect(result).toHaveLength(2);
      expect(result[1]).toMatchObject({ ...payload, author: 'me' });
      expect(result[1].id).toMatch(/^temp-id-\d+$/);

      // Test empty old data
      const resultEmpty = updater(undefined);
      expect(resultEmpty).toHaveLength(1);

      vi.mocked(queryCache.getQueryData).mockReturnValue(undefined);
      const contextEmpty = onMutate(payload);
      expect(contextEmpty.previousRecipes).toEqual([]);

      vi.mocked(queryCache.setQueryData).mockClear();
      const onError = (addRecipeMutation() as any).onError;
      onError(new Error('test error'), payload, context);
      expect(queryCache.setQueryData).toHaveBeenCalledWith(RECIPE_KEYS.my(), previousRecipes);

      // Test missing context in onError
      vi.mocked(queryCache.setQueryData).mockClear();
      onError(new Error('test error'), payload, undefined as any);
      expect(queryCache.setQueryData).not.toHaveBeenCalled();

      // Test context without previousRecipes
      vi.mocked(queryCache.setQueryData).mockClear();
      onError(new Error('test error'), payload, {} as any);
      expect(queryCache.setQueryData).not.toHaveBeenCalled();
    });

    it('should handle onSuccess and onSettled', () => {
      const queryCache = useQueryCache();
      const mockData = { id: 'new-1', name: 'New' };
      const onSuccess = (addRecipeMutation() as any).onSuccess;
      onSuccess(mockData);

      const deleteOnSuccess = (deleteRecipeMutation() as any).onSuccess;
      deleteOnSuccess();
      expect(toast.success).toHaveBeenCalledWith('Recipe was deleted successfully');

      const onSettled = (addRecipeMutation() as any).onSettled;
      onSettled();
      expect(queryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
    });
  });

  describe('addImageMutation', () => {
    it('should patch recipe image', async () => {
      const payload = {
        id: '1',
        image: new File([''], 'test.jpg', { type: 'image/jpeg' }),
      };
      const mockData = { id: '1', image_url: 'http://test.jpg' };
      mockApi.onPatch('/recipes/1/image').reply(200, mockData);

      const mutation = (addImageMutation() as any).mutation;
      const result = await mutation(payload);

      expect(result).toEqual(mockData);
    });

    it('should update cache on image upload success', () => {
      const queryCache = useQueryCache();
      const mockRecipe = { id: '1', name: 'Recipe', author: 'me' };
      const mockImage = { id: '1', image_url: 'http://test.jpg', name: 'Recipe', author: 'me' };
      (queryCache.getQueryData as any).mockReturnValue([mockRecipe]);

      const onSuccess = (addImageMutation() as any).onSuccess;
      onSuccess(mockImage);

      expect(queryCache.setQueryData).toHaveBeenCalledWith(RECIPE_KEYS.my(), expect.any(Function));

      // Test the updater function
      const updater = vi.mocked(queryCache.setQueryData).mock.calls[0][1] as Function;
      const result = updater([mockRecipe]);
      expect(result).toEqual([{ ...mockRecipe, ...mockImage }]);

      // Test with non-matching id
      const resultNonMatching = updater([{ id: '2', name: 'Other' }]);
      expect(resultNonMatching).toEqual([{ id: '2', name: 'Other' }]);

      // Test with empty cache
      const resultEmpty = updater(undefined);
      expect(resultEmpty).toEqual([]);

      const onSettled = (addImageMutation() as any).onSettled;
      onSettled();
      expect(queryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
    });

    it('should handle onError for image upload', () => {
      const onError = (addImageMutation() as any).onError;
      const error = new Error('upload failed');

      onError(error, { id: '1', image: {} as File });

      expect(toast.error).toHaveBeenCalledWith('Upload has failed: upload failed');
    });
  });

  describe('deleteRecipeMutation', () => {
    it('should delete a recipe', async () => {
      const id = '1';
      mockApi.onDelete(`/recipes/${id}`).reply(204, null);

      const mutation = (deleteRecipeMutation() as any).mutation;
      const result = await mutation(id);

      expect(result).toBeUndefined();
    });

    it('should handle onMutate, onError, and onSettled', () => {
      const id = '1';
      const queryCache = useQueryCache();
      const previousRecipes = [{ id: '1', name: 'Recipe' }];
      (queryCache.getQueryData as any).mockReturnValue(previousRecipes);

      const mutationObj = deleteRecipeMutation() as any;

      const context = mutationObj.onMutate(id);
      expect(queryCache.cancelQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
      expect(queryCache.setQueryData).toHaveBeenCalledWith(RECIPE_KEYS.my(), expect.any(Function));

      // Test the updater function
      const updater = vi.mocked(queryCache.setQueryData).mock.calls[0][1] as Function;
      const result = updater(previousRecipes);
      expect(result).toEqual([]);

      vi.mocked(queryCache.getQueryData).mockReturnValue(undefined);
      const contextEmpty = mutationObj.onMutate(id);
      expect(contextEmpty.previousRecipes).toEqual([]);

      expect(context).toEqual({ previousRecipes });

      mutationObj.onError(new Error('fail'), id, context);
      expect(queryCache.setQueryData).toHaveBeenCalledWith(RECIPE_KEYS.my(), previousRecipes);
      expect(toast.error).toHaveBeenCalledWith('Failed to delete the recipe');

      // Test missing context in onError
      vi.mocked(toast.error).mockClear();
      vi.mocked(queryCache.setQueryData).mockClear();
      mutationObj.onError(new Error('fail'), id, undefined);
      expect(toast.error).toHaveBeenCalledWith('Failed to delete the recipe');
      expect(queryCache.setQueryData).not.toHaveBeenCalled();

      // Test context without previousRecipes
      vi.mocked(toast.error).mockClear();
      vi.mocked(queryCache.setQueryData).mockClear();
      mutationObj.onError(new Error('fail'), id, {} as any);
      expect(toast.error).toHaveBeenCalledWith('Failed to delete the recipe');
      expect(queryCache.setQueryData).not.toHaveBeenCalled();

      mutationObj.onSettled(null, undefined, id, context);
      expect(queryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
      expect(queryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.detail(id) });
    });
  });

  describe('toggleFavoriteMutation', () => {
    it('should post to favorite when is_favorite is false', async () => {
      const payload = { id: '1', is_favorite: false };
      const mockData = { id: '1', name: 'Recipe', is_favorite: true };
      mockApi.onPost('/recipes/1/favorite').reply(201, mockData);

      const mutation = (toggleFavoriteMutation() as any).mutation;
      const result = await mutation(payload);

      expect(result).toEqual(mockData);
    });

    it('should delete from favorite when is_favorite is true', async () => {
      const payload = { id: '1', is_favorite: true };
      mockApi.onDelete('/recipes/1/favorite').reply(204);

      const mutation = (toggleFavoriteMutation() as any).mutation;
      const result = await mutation(payload);

      expect(result).toEqual({ id: '1', is_favorite: false });
    });

    it('should handle onMutate, onError, and onSuccess', async () => {
      const id = '1';
      const payload = { id, is_favorite: false };
      const queryCache = useQueryCache();
      const mockRecipe = { id: '1', name: 'Recipe', is_favorite: false };
      const previousData = [mockRecipe];
      (queryCache.getQueryData as any).mockReturnValue(previousData);

      const mutationObj = toggleFavoriteMutation() as any;

      const context = await mutationObj.onMutate(payload);
      expect(queryCache.cancelQueries).toHaveBeenCalled();
      expect(queryCache.setQueryData).toHaveBeenCalled();

      // Test onError
      mutationObj.onError(new Error('fail'), payload, context);
      expect(queryCache.setQueryData).toHaveBeenCalledWith(expect.any(Array), previousData);

      // Test onSuccess
      mutationObj.onSuccess({ id, is_favorite: true }, payload, context);
      expect(queryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.favorites() });

      // Test onSuccess for unmarking favorite
      mutationObj.onSuccess({ id, is_favorite: false }, { id, is_favorite: true }, context);
      // Should not invalidate favorites again (or rather, the condition if(!is_favorite) is for the payload's is_favorite)
    });

    it('should handle onMutate with is_favorite true and single recipe data', async () => {
      const id = '1';
      const payload = { id, is_favorite: true };
      const queryCache = useQueryCache();
      const mockRecipe = { id: '1', name: 'Recipe', is_favorite: true };

      // Mock queryCache.getQueryData to return single recipe instead of array
      (queryCache.getQueryData as any).mockImplementation((key: any) => {
        if (key[1] === 'detail') return mockRecipe;
        return [mockRecipe];
      });

      const mutationObj = toggleFavoriteMutation() as any;
      await mutationObj.onMutate(payload);

      expect(queryCache.setQueryData).toHaveBeenCalled();

      // Test the updater function for array of recipes
      const myKey = RECIPE_KEYS.my();
      const myCall = vi
        .mocked(queryCache.setQueryData)
        .mock.calls.find((call) => JSON.stringify(call[0]) === JSON.stringify(myKey));
      if (myCall) {
        const updater = myCall[1] as Function;
        const result = updater([
          { id: '1', is_favorite: true },
          { id: '2', is_favorite: false },
        ]);
        expect(result[0].is_favorite).toBe(false);
        expect(result[1].is_favorite).toBe(false);
      }

      // Test the updater function for single recipe
      const detailKey = RECIPE_KEYS.detail(id);
      const detailCall = vi
        .mocked(queryCache.setQueryData)
        .mock.calls.find((call) => JSON.stringify(call[0]) === JSON.stringify(detailKey));
      if (detailCall) {
        const updater = detailCall[1] as Function;
        expect(updater(mockRecipe).is_favorite).toBe(false);
        expect(updater(null)).toBeNull();
        expect(updater({ id: '2', is_favorite: true }).is_favorite).toBe(true);
      }

      // Test the favorites filter
      const favoritesKey = RECIPE_KEYS.favorites();
      const favoritesCalls = vi
        .mocked(queryCache.setQueryData)
        .mock.calls.filter((call) => JSON.stringify(call[0]) === JSON.stringify(favoritesKey));

      expect(favoritesCalls.length).toBe(2);

      const filterUpdater = favoritesCalls[1][1] as Function;
      const favorites = [{ id: '1' }, { id: '2' }];
      const filtered = filterUpdater(favorites);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');

      // Test empty defaults
      expect(filterUpdater(undefined)).toEqual([]);
    });

    it('should handle onSettled', () => {
      const id = '1';
      const queryCache = useQueryCache();
      const mutationObj = toggleFavoriteMutation() as any;

      mutationObj.onSettled(undefined, null, { id });
      expect(queryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.detail(id) });
    });
  });

  describe('getFavoritesQuery', () => {
    it('should fetch favorite recipes', async () => {
      const mockData = [{ id: '1', name: 'Favorite Recipe' }];
      mockApi.onGet('/recipes/favorites').reply(200, mockData);

      const options = getFavoritesQuery();
      // @ts-ignore
      const result = await options.query();

      expect(result).toEqual(mockData);
    });
  });
});
