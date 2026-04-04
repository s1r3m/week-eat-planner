import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { apiClient } from '@/api/client';
import MockAdapter from 'axios-mock-adapter';
import { useRecipeStore } from '../recipes';
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

  describe('getRecipe', () => {
    it('should get a recipe by id successfully', async () => {
      const store = useRecipeStore();
      const mockRecipe = { id: 'recipe-1', name: 'Pasta', author: 'me', isFavorite: false };
      mockApiClient.onGet('/recipes/recipe-1').reply(200, mockRecipe);

      const result = await store.getRecipe('recipe-1');

      expect(result).toEqual(mockRecipe);
    });
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      const store = useRecipeStore();
      const newRecipe = { name: 'New Pasta', ingredients: [] };
      const createdRecipe = { id: 'recipe-new', ...newRecipe, author: 'me', isFavorite: false };
      mockApiClient.onPost('/recipes').reply(201, createdRecipe);

      await store.createRecipe(newRecipe as any);

      expect(store.myRecipes).toContainEqual(createdRecipe);
    });
  });

  describe('updateRecipe', () => {
    it('should update a recipe successfully', async () => {
      const store = useRecipeStore();
      const consoleSpy = vi.spyOn(console, 'log');
      await store.updateRecipe('1', { name: 'Updated' });
      expect(consoleSpy).toHaveBeenCalledWith('Updating recipe:', '1', { name: 'Updated' });
    });
  });

  describe('deleteRecipe', () => {
    it('should delete a recipe successfully', async () => {
      const store = useRecipeStore();
      mockApiClient.onDelete('/recipes/1').reply(204);

      await store.deleteRecipe('1');
      expect(mockApiClient.history.delete.length).toBe(1);
    });
  });

  describe('uploadImage', () => {
    it('should upload an image and update the recipe in the store if it exists', async () => {
      const store = useRecipeStore();
      const mockRecipe = { id: 'recipe-1', name: 'Pasta', author: 'me', isFavorite: false };
      store.myRecipes = [mockRecipe];

      const updatedRecipe = { ...mockRecipe, image_url: 'http://example.com/img.jpg' };
      mockApiClient.onPatch('/recipes/recipe-1/image').reply(200, updatedRecipe);

      const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
      await store.uploadImage('recipe-1', file);

      expect(store.myRecipes[0]).toEqual(updatedRecipe);
    });

    it('should upload an image and do nothing to store if recipe does not exist', async () => {
      const store = useRecipeStore();
      store.myRecipes = [];

      const updatedRecipe = {
        id: 'recipe-1',
        name: 'Pasta',
        author: 'me',
        isFavorite: false,
        image_url: 'http://example.com/img.jpg',
      };
      mockApiClient.onPatch('/recipes/recipe-1/image').reply(200, updatedRecipe);

      const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
      await store.uploadImage('recipe-1', file);

      expect(store.myRecipes).toEqual([]);
    });
  });

  describe('getRecipeNameById', () => {
    it('should return the recipe name if it exists', () => {
      const store = useRecipeStore();
      store.myRecipes = [{ id: '1', name: 'Pasta', author: 'me', isFavorite: false }];
      expect(store.getRecipeNameById('1')).toBe('Pasta');
    });

    it('should return error message if recipe does not exist', () => {
      const store = useRecipeStore();
      expect(store.getRecipeNameById('non-existent')).toBe('error recipe name');
    });
  });
});
