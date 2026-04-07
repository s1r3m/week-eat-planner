import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import { apiClient } from './client';

export const UNITS = ['g', 'ml', 'pcs', 'cans'] as const;
type Unit = (typeof UNITS)[number];

/**
 * Minimal recipe information used for lists and previews.
 */
export interface RecipePreview {
  id: string;
  name: string;
  author: string;
  isFavorite?: boolean;
  isOfficial?: boolean;
  image_url?: string;
}

export interface CookingStep {
  order: number;
  step: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: Unit;
}

/**
 * Comprehensive recipe data including cooking steps and ingredients.
 */
export interface RecipeFull extends RecipePreview {
  steps: CookingStep[];
  ingredients: Ingredient[];
}

export interface RecipePayload {
  name: string;
  steps: CookingStep[];
  ingredients: Ingredient[];
  is_public: boolean;
}

export interface ImagePayload {
  id: string;
  image: File;
}

export const RECIPE_KEYS = {
  root: ['recipes'] as const,
  my: () => [...RECIPE_KEYS.root, 'mine'] as const,
  detail: (id: string) => [...RECIPE_KEYS.root, 'detail', id] as const,
};

/**
 * Query options for fetching the current user's recipe collection.
 * Uses `@pinia/colada` for caching and state management.
 */
export const getMyRecipesQuery = defineQueryOptions(() => ({
  key: RECIPE_KEYS.my(),
  query: () => apiClient.get<RecipePreview[]>('/my_recipes').then((res) => res.data),
}));

/**
 * Query options for fetching full details of a specific recipe.
 *
 * @param id - Unique identifier of the recipe.
 */
export const getRecipeQuery = defineQueryOptions((id: string) => ({
  key: RECIPE_KEYS.detail(id),
  query: () => apiClient.get<RecipeFull>(`/recipes/${id}`).then((res) => res.data),
}));

/**
 * Mutation for adding a new recipe.
 * Performs optimistic updates on the 'my recipes' list by adding a temporary item.
 */
export const addRecipeMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  return {
    mutation: (payload: RecipePayload) =>
      apiClient.post<RecipePreview>('/recipes', payload).then((res) => res.data),
    onMutate: (payload: RecipePayload) => {
      queryCache.cancelQueries({ key: RECIPE_KEYS.my() });
      const previousRecipes = queryCache.getQueryData<RecipePreview[]>(RECIPE_KEYS.my()) || [];
      queryCache.setQueryData(RECIPE_KEYS.my(), (old: RecipePreview[] = []) => [
        ...old,
        { id: `temp-id-${Date.now()}`, ...payload, author: 'me' },
      ]);
      return { previousRecipes };
    },
    onSuccess: (
      created: RecipePreview,
      _payload: RecipePayload,
      _context: { previousRecipes?: RecipePreview[] },
    ) => {
      console.debug(`Recipe ${created.id} has been created`);
      return created;
    },
    onError: (
      err: Error,
      payload: RecipePayload,
      context: { previousRecipes?: RecipePreview[] },
    ) => {
      console.error(`An error has occurred during creation of ${payload.name}: `, err);
      if (context?.previousRecipes)
        queryCache.setQueryData(RECIPE_KEYS.my(), context.previousRecipes);
    },
    onSettled: () => queryCache.invalidateQueries({ key: RECIPE_KEYS.my() }),
  };
});

/**
 * Mutation for uploading or updating a recipe's cover image.
 * Uses `FormData` to send the image file to the backend.
 */
export const addImageMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  return {
    mutation: (payload: ImagePayload) => {
      const formData = new FormData();
      formData.append('image', payload.image);
      return apiClient
        .patch<RecipePreview>(`/recipes/${payload.id}/image`, formData)
        .then((res) => res.data);
    },
    onSuccess: (data: RecipePreview) => {
      console.debug('Image uploaded successfully');
      const recipes = queryCache.getQueryData<RecipePreview[]>(RECIPE_KEYS.my()) || [];
      queryCache.setQueryData(
        RECIPE_KEYS.my(),
        recipes.map((recipe: RecipePreview) =>
          recipe.id === data.id ? { ...recipe, ...data } : recipe,
        ),
      );
    },
    onError: (err: Error) => console.debug('Image upload failed: ', err),
    onSettled: () => queryCache.invalidateQueries({ key: RECIPE_KEYS.my() }),
  };
});

/**
 * Mutation for deleting a recipe.
 * Performs optimistic updates by removing the recipe from the local list immediately.
 */
export const deleteRecipeMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: (id: string) => apiClient.delete<null>(`/recipes/${id}`).then((res) => res.data),
    onMutate: (id: string) => {
      queryCache.cancelQueries({ key: RECIPE_KEYS.my() });
      const previousRecipes = queryCache.getQueryData<RecipePreview[]>(RECIPE_KEYS.my()) || [];
      queryCache.setQueryData(
        RECIPE_KEYS.my(),
        previousRecipes.filter((recipe: RecipePreview) => recipe.id !== id),
      );
      return { previousRecipes };
    },
    onSuccess: (_: null, id: string, _context: { previousRecipes?: RecipePreview[] }) => {
      console.debug(`The recipe ${id} has been deleted`);
    },
    onError: (err: Error, id: string, context?: { previousRecipes?: RecipePreview[] }) => {
      console.error(`An error has occurred during deletion of recipe ${id}: `, err);
      if (context?.previousRecipes) {
        queryCache.setQueryData(RECIPE_KEYS.my(), context.previousRecipes);
      }
    },
    onSettled: (
      _: null | undefined,
      _err: Error | undefined,
      id: string,
      _context: { previousRecipes?: RecipePreview[] },
    ) => {
      queryCache.invalidateQueries({ key: RECIPE_KEYS.my() });
      queryCache.invalidateQueries({ key: RECIPE_KEYS.detail(id) });
    },
  };
});
