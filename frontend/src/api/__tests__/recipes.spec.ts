import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { createPinia, setActivePinia } from 'pinia';
import { apiClient } from '../client';
import { getRecipesQuery, getRecipeQuery, RECIPE_KEYS } from '../recipes';

vi.mock('@pinia/colada', () => ({
  defineQueryOptions: (fn: any) => fn,
}));

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
  });

  describe('getRecipesQuery', () => {
    it('should have correct key', () => {
      const options = getRecipesQuery();
      expect(options.key).toEqual(RECIPE_KEYS.all());
    });

    it('should fetch recipes', async () => {
      const mockData = [{ id: '1', name: 'Recipe 1' }];
      mockApi.onGet('/recipes').reply(200, mockData);

      const options = getRecipesQuery();
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
});
