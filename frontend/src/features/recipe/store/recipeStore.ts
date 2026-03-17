import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RecipeMinimal } from '@/domain/recipe/models';
import { apiClient } from '@/api/client';

export const useRecipeStore = defineStore('recipe-store', () => {
  const myRecipes = ref<RecipeMinimal[]>([]);

  const getMyRecipes = async () => {
    const { data } = await apiClient.get('/recipes');
    myRecipes.value = data;
  };

  return {
    myRecipes,
    getMyRecipes,
  };
});
