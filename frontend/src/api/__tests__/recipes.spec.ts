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
} from '../recipes';

vi.mock('@pinia/colada', () => {
  return {
    defineQueryOptions: (fn: any) => fn,
    defineMutation: (fn: any) => fn,
    useQueryCache: vi.fn(),
  };
});

vi.mock('@/features/auth/store/auth', () => ({
  useAuthStore: vi.fn(() => ({
    accessToken: 'test-token',
  })),
}));

describe('recipes api', () => {
  let mockApi: MockAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi = new MockAdapter(apiClient);
    vi.clearAllMocks();
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
      mockApi.onGet('/my_recipes').reply(200, mockData);

      const options = getMyRecipesQuery();
      const result = await (options.query as any)();

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
      const result = await (options.query as any)();

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

      vi.mocked(queryCache.setQueryData).mockClear();
      const onError = (addRecipeMutation() as any).onError;
      onError(new Error('test error'), payload, context);
      expect(queryCache.setQueryData).toHaveBeenCalledWith(RECIPE_KEYS.my(), previousRecipes);

      // Test missing context in onError
      vi.mocked(queryCache.setQueryData).mockClear();
      onError(new Error('test error'), payload, undefined as any);
      expect(queryCache.setQueryData).not.toHaveBeenCalled();
    });

    it('should handle onSuccess and onSettled', () => {
      const queryCache = useQueryCache();
      const mockData = { id: 'new-1', name: 'New' };
      const onSuccess = (addRecipeMutation() as any).onSuccess;
      onSuccess(mockData);

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

    it('should handle onError', () => {
      const consoleSpy = vi.spyOn(console, 'debug');
      const onError = (addImageMutation() as any).onError;

      onError(new Error('fail'));

      expect(consoleSpy).toHaveBeenCalledWith('Image upload failed: ', expect.any(Error));
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

      expect(context).toEqual({ previousRecipes });

      mutationObj.onSuccess(null, id, context);

      mutationObj.onError(new Error('fail'), id, context);
      expect(queryCache.setQueryData).toHaveBeenCalledWith(RECIPE_KEYS.my(), previousRecipes);

      // Test missing context in onError
      vi.mocked(queryCache.setQueryData).mockClear();
      mutationObj.onError(new Error('fail'), id, undefined);
      expect(queryCache.setQueryData).not.toHaveBeenCalled();

      mutationObj.onSettled(null, undefined, id, context);
      expect(queryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.my() });
      expect(queryCache.invalidateQueries).toHaveBeenCalledWith({ key: RECIPE_KEYS.detail(id) });
    });
  });
});
