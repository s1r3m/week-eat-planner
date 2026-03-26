import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RecipeMinimal, RecipeFull, RecipePayload } from '@/domain/recipe/models';
import { apiClient } from '@/api/client';

export const useRecipeStore = defineStore('recipe-store', () => {
  const myRecipes = ref<RecipeMinimal[]>([]);

  const getMyRecipes = async () => {
    const { data } = await apiClient.get('/recipes');
    myRecipes.value = data;
  };

  const createRecipe = async (recipe: RecipePayload) => {
    const { data } = await apiClient.post<RecipeMinimal>('/recipes', recipe);
    myRecipes.value.push(data);
  };

  const updateRecipe = async (id: string, recipe: Partial<RecipeFull>) => {
    // Stub for now. Real API call will go here
    console.log('Updating recipe:', id, recipe);
    return Promise.resolve();
  };

  const getRecipe = async (recipeId: string) => {
    const { data } = await apiClient.get<RecipeFull>(`/recipes/${recipeId}`);
    return data;
  };

  const getRecipeNameById = (recipeId: string) => {
    const recipe = myRecipes.value.find((r) => r.id === recipeId);
    return recipe?.name ?? 'error recipe name';
  };

  return {
    myRecipes,
    getMyRecipes,
    getRecipe,
    getRecipeNameById,
    createRecipe,
    updateRecipe,
  };
});
