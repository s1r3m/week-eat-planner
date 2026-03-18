import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RecipeMinimal, RecipeFull } from '@/domain/recipe/models';
import { apiClient } from '@/api/client';

export const useRecipeStore = defineStore('recipe-store', () => {
  const myRecipes = ref<RecipeMinimal[]>([]);

  const getMyRecipes = async () => {
    const { data } = await apiClient.get('/recipes');
    myRecipes.value = data;
  };

  const createRecipe = async (name: string) => {
    // Stub for now. Real API call will go here
    console.log('Creating recipe:', name);
    return Promise.resolve();
  };

  const updateRecipe = async (id: string, recipe: Partial<RecipeFull>) => {
    // Stub for now. Real API call will go here
    console.log('Updating recipe:', id, recipe);
    return Promise.resolve();
  };

  return {
    myRecipes,
    getMyRecipes,
    createRecipe,
    updateRecipe,
  };
});
