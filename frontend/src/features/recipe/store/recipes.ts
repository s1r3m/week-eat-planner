import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RecipeMinimal, RecipeFull, RecipePayload } from '@/domain/recipe/models';
import { apiClient } from '@/api/client';

/**
 * Store for managing user recipes.
 */
export const useRecipeStore = defineStore('recipe-store', () => {
  /** List of recipes belonging to the current user. */
  const myRecipes = ref<RecipeMinimal[]>([]);

  /**
   * Fetches user recipes from the API.
   * @returns A promise that resolves when recipes are fetched.
   */
  const getMyRecipes = async () => {
    const { data } = await apiClient.get('/recipes');
    myRecipes.value = data;
  };

  /**
   * Creates a new recipe.
   * @param recipe - The recipe payload to create.
   * @returns A promise that resolves to the new recipe's ID.
   */
  const createRecipe = async (recipe: RecipePayload) => {
    const { data } = await apiClient.post<RecipeMinimal>('/recipes', recipe);
    myRecipes.value.push(data);
    return data.id;
  };

  /**
   * Updates an existing recipe (stub).
   * @param id - The ID of the recipe to update.
   * @param recipe - The partial recipe data to update.
   * @returns A promise that resolves when the update is complete.
   */
  const updateRecipe = async (id: string, recipe: Partial<RecipeFull>) => {
    // Stub for now. Real API call will go here
    console.log('Updating recipe:', id, recipe);
    return Promise.resolve();
  };

  /**
   * Uploads an image for a recipe.
   * @param recipeId - The ID of the recipe.
   * @param image - The image file to upload.
   * @returns A promise that resolves when the image is uploaded.
   */
  const uploadImage = async (recipeId: string, image: File) => {
    const formData = new FormData();
    formData.append('image', image);

    const { data } = await apiClient.patch<RecipeFull>(`/recipes/${recipeId}/image`, formData);

    const index = myRecipes.value.findIndex((r) => r.id === recipeId);
    if (index !== -1) {
      myRecipes.value[index] = data;
    }
  };

  /**
   * Fetches a full recipe by ID.
   * @param recipeId - The ID of the recipe to fetch.
   * @returns A promise that resolves to the full recipe data.
   */
  const getRecipe = async (recipeId: string) => {
    const { data } = await apiClient.get<RecipeFull>(`/recipes/${recipeId}`);
    return data;
  };

  /**
   * Deletes a recipe by ID.
   * @param recipeId - The ID of the recipe to delete.
   * @returns A promise that resolves when the recipe is deleted.
   */
  const deleteRecipe = async (recipeId: string) => {
    await apiClient.delete<null>(`/recipes/${recipeId}`);
    myRecipes.value = myRecipes.value.filter((r) => r.id !== recipeId);
  };

  /**
   * Returns a recipe's name given its ID.
   * @param recipeId - The ID of the recipe.
   * @returns The name of the recipe, or 'error recipe name' if not found.
   */
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
    deleteRecipe,
    updateRecipe,
    uploadImage,
  };
});
