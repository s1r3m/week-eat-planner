import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { apiClient } from '@/api/client';
import MockAdapter from 'axios-mock-adapter';
import { useRecipeStore } from './recipes';
import type { RecipeMinimal } from '@/domain/recipe/models';

describe('recipes store', () => {
  let mockApiClient: MockAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiClient = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mockApiClient.restore();
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const store = useRecipeStore();
    expect(store.myRecipes).toEqual([]);
  });

  describe('getMyRecipes', () => {
    it('should get recipes successfully', async () => {
      const store = useRecipeStore();
      const mockRecipes: RecipeMinimal[] = [
        { id: 'recipe-1', name: 'Pasta', author: 'me', isFavorite: false },
        { id: 'recipe-2', name: 'Soup', author: 'me', isFavorite: true },
      ];
      mockApiClient.onGet('/recipes').reply(200, mockRecipes);

      await store.getMyRecipes();

      expect(store.myRecipes).toEqual(mockRecipes);
    });
  });
});
