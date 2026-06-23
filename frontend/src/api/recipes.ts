import { defineMutation, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type { EntryKey } from '@pinia/colada';
import { apiClient } from './client';
import { toast } from 'vue-sonner';

/**
 * Supported measurement units for recipe ingredients.
 */
export const UNITS = ['g', 'ml', 'pcs', 'cans'] as const;
/**
 * Measurement units for recipe ingredients.
 */
type Unit = (typeof UNITS)[number];

/**
 * Minimal recipe information used for lists and previews.
 */
export interface RecipePreview {
  id: string;
  name: string;
  author: string;
  is_favorite: boolean;
  image_url: string | null;
  isOfficial?: boolean;
}

/**
 * Represents a single step in the cooking process.
 */
export interface CookingStep {
  order: number;
  step: string;
}

/**
 * Represents an ingredient required for a recipe.
 */
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

/**
 * Payload for creating or updating a recipe.
 */
export interface RecipePayload {
  name: string;
  steps: CookingStep[];
  ingredients: Ingredient[];
  is_public: boolean;
}

/**
 * Variables required to update a recipe.
 */
export interface UpdateRecipeVars {
  id: string;
  payload: RecipePayload;
}

/**
 * Payload for uploading a recipe image.
 */
export interface ImagePayload {
  id: string;
  image: File;
}

/**
 * Payload for toggling a recipe's favorite status.
 */
export interface FavoritePayload {
  id: string;
  is_favorite: boolean;
}

/**
 * Cache keys for recipe-related queries.
 */
export const RECIPE_KEYS = {
  /** Base key for all recipes. */
  root: ['recipes'] as const,
  /**
   * Key for the current user's recipes.
   * @returns Hierarchical cache key.
   */
  my: () => [...RECIPE_KEYS.root, 'mine'] as const,
  /**
   * Key for the user's favorite recipes.
   * @returns Hierarchical cache key.
   */
  favorites: () => [...RECIPE_KEYS.root, 'favorites'] as const,
  /**
   * Key for a specific recipe detail.
   * @param id - The recipe ID.
   * @returns Hierarchical cache key.
   */
  detail: (id: string) => [...RECIPE_KEYS.root, 'detail', id] as const,
};

/**
 * Query options for fetching the current user's recipe collection.
 * Uses `@pinia/colada` for caching and state management.
 *
 * @returns Colada query options for the user's recipes list.
 */
export const getMyRecipesQuery = defineQueryOptions(() => ({
  key: RECIPE_KEYS.my(),
  query: () => apiClient.get<RecipePreview[]>('/recipes/my_recipes').then((res) => res.data),
}));

/**
 * Query options for fetching full details of a specific recipe.
 *
 * @param id - Unique identifier of the recipe.
 * @returns Colada query options for the recipe details.
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
    onSuccess: (created: RecipePreview) =>
      toast.success(`Recipe ${created.name} created successfully`),
    onError: (err: Error, payload: RecipePayload) =>
      toast.error(`An error occurred while creating recipe ${payload.name}: ${err.message}`),
    onSettled: () => queryCache.invalidateQueries({ key: RECIPE_KEYS.my() }),
  };
});

/**
 * Mutation for updating a recipe's details.
 * Optimistically merges the payload into the cached recipe detail.
 */
export const editRecipeMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  return {
    mutation: ({ id, payload }: UpdateRecipeVars) =>
      apiClient.patch<RecipeFull>(`/recipes/${id}`, payload).then((res) => res.data),
    onMutate: ({ id, payload }: UpdateRecipeVars) => {
      queryCache.cancelQueries({ key: RECIPE_KEYS.detail(id) });
      queryCache.cancelQueries({ key: RECIPE_KEYS.my() });
      queryCache.cancelQueries({ key: RECIPE_KEYS.favorites() });
      const previousRecipe = queryCache.getQueryData<RecipeFull>(RECIPE_KEYS.detail(id));
      queryCache.setQueryData(RECIPE_KEYS.detail(id), { ...previousRecipe, ...payload });
      return { previousRecipe };
    },
    onSuccess: (
      data: RecipeFull,
      _vars: UpdateRecipeVars,
      _context?: { previousRecipe?: RecipeFull },
    ) => {
      toast.success(`Recipe ${data.name} updated successfully`);
    },
    onError: (
      err: Error,
      { id, payload }: UpdateRecipeVars,
      context?: { previousRecipe?: RecipeFull },
    ) => {
      toast.error(`An error occurred while updating recipe ${payload.name}: ${err.message}`);
      if (context?.previousRecipe) {
        queryCache.setQueryData(RECIPE_KEYS.detail(id), context.previousRecipe);
        queryCache.invalidateQueries({ key: RECIPE_KEYS.detail(id) });
        queryCache.invalidateQueries({ key: RECIPE_KEYS.my() });
        queryCache.invalidateQueries({ key: RECIPE_KEYS.favorites() });
      }
    },
  };
});

/**
 * Mutation for uploading or updating a recipe's cover image.
 * Uses `FormData` to send the image file to the backend.
 */
export const addImageMutation = defineMutation(() => {
  const queryCache = useQueryCache();
  return {
    mutation: ({ id, image }: ImagePayload) => {
      const formData = new FormData();
      formData.append('image', image);
      return apiClient
        .patch<RecipePreview>(`/recipes/${id}/image`, formData)
        .then((res) => res.data);
    },
    onSuccess: (data: RecipePreview) => {
      queryCache.setQueryData(RECIPE_KEYS.my(), (old: RecipePreview[] = []) =>
        old.map((recipe: RecipePreview) =>
          recipe.id === data.id ? { ...recipe, ...data } : recipe,
        ),
      );
    },
    onError: (err: Error, _payload: ImagePayload) => {
      toast.error(`Upload has failed: ${err.message}`);
    },
    onSettled: (data: RecipePreview | undefined, _err: Error | undefined, { id }: ImagePayload) => {
      queryCache.invalidateQueries({ key: RECIPE_KEYS.my() });
      queryCache.invalidateQueries({ key: RECIPE_KEYS.detail(id) });
    },
  };
});

/**
 * Mutation for deleting a recipe.
 * Performs optimistic updates by removing the recipe from the local list immediately.
 */
export const deleteRecipeMutation = defineMutation(() => {
  const queryCache = useQueryCache();

  return {
    mutation: (id: string) => apiClient.delete<void>(`/recipes/${id}`).then(() => undefined),
    onMutate: (id: string) => {
      queryCache.cancelQueries({ key: RECIPE_KEYS.my() });
      const previousRecipes = queryCache.getQueryData<RecipePreview[]>(RECIPE_KEYS.my()) || [];
      queryCache.setQueryData(RECIPE_KEYS.my(), (old: RecipePreview[] = []) =>
        old.filter((recipe: RecipePreview) => recipe.id !== id),
      );
      return { previousRecipes };
    },
    onSuccess: () => {
      toast.success(`Recipe was deleted successfully`);
    },
    onError: (_err: Error, _id: string, context?: { previousRecipes?: RecipePreview[] }) => {
      toast.error('Failed to delete the recipe');
      if (context && context.previousRecipes) {
        queryCache.setQueryData(RECIPE_KEYS.my(), context.previousRecipes);
      }
    },
    onSettled: (
      _: undefined,
      _err: Error | undefined,
      id: string,
      _context: { previousRecipes?: RecipePreview[] },
    ) => {
      queryCache.invalidateQueries({ key: RECIPE_KEYS.my() });
      queryCache.invalidateQueries({ key: RECIPE_KEYS.detail(id) });
    },
  };
});

/**
 * Mutation for toggling a recipe's favorite status.
 * Optimistically updates the recipe in the detail, list, and favorites caches.
 */
export const toggleFavoriteMutation = defineMutation(() => {
  type RecipeCacheData = RecipePreview[] | RecipePreview | undefined;
  const queryCache = useQueryCache();

  return {
    mutation: ({ id, is_favorite }: FavoritePayload) => {
      if (is_favorite) {
        return apiClient
          .delete<void>(`/recipes/${id}/favorite`)
          .then(() => ({ id, is_favorite: false }) as FavoritePayload);
      } else {
        return apiClient
          .post<RecipePreview>(`/recipes/${id}/favorite`)
          .then((res) => res.data as RecipePreview);
      }
    },
    onMutate: async ({ id, is_favorite }: FavoritePayload) => {
      const keysToHandle: EntryKey[] = [
        RECIPE_KEYS.detail(id),
        RECIPE_KEYS.my(),
        RECIPE_KEYS.favorites(),
      ];
      await Promise.all(keysToHandle.map((key) => queryCache.cancelQueries({ key })));

      const previousState = new Map<EntryKey, RecipeCacheData>();
      keysToHandle.forEach((key) => previousState.set(key, queryCache.getQueryData(key)));

      const updateRecipe = (old: RecipeCacheData) => {
        if (Array.isArray(old)) {
          return old.map((r) => (r.id === id ? { ...r, is_favorite: !is_favorite } : r));
        }
        return old && old.id === id ? { ...old, is_favorite: !is_favorite } : old;
      };
      keysToHandle.forEach((key) => {
        queryCache.setQueryData(key, updateRecipe);
      });
      // Favorites are different
      if (is_favorite) {
        queryCache.setQueryData(RECIPE_KEYS.favorites(), (old: RecipePreview[] = []) =>
          old.filter((recipe: RecipePreview) => recipe.id !== id),
        );
      } else {
        // We don't have a RecipePreview to add though.
      }

      return { previousState };
    },
    onError: (
      err: Error,
      _payload: FavoritePayload,
      context?: { previousState?: Map<EntryKey, RecipeCacheData> },
    ) => {
      context?.previousState?.forEach((data, key) => queryCache.setQueryData(key, data));
    },
    onSuccess: (
      _data: FavoritePayload | RecipePreview,
      { id, is_favorite }: FavoritePayload,
      _context?: { previousState?: Map<EntryKey, RecipeCacheData> },
    ) => {
      console.debug(`The recipe ${id} has been marked is_favorite=${!is_favorite}`);
      if (!is_favorite) queryCache.invalidateQueries({ key: RECIPE_KEYS.favorites() });
    },
    onSettled: (
      _data: FavoritePayload | RecipePreview | undefined,
      _err: Error | null | undefined,
      { id }: FavoritePayload,
      _context?: { previousState?: Map<EntryKey, RecipeCacheData> },
    ) => {
      queryCache.invalidateQueries({ key: RECIPE_KEYS.detail(id) });
    },
  };
});

/**
 * Query options for fetching the current user's favorited recipes.
 */
export const getFavoritesQuery = defineQueryOptions(() => ({
  key: RECIPE_KEYS.favorites(),
  query: () => apiClient.get<RecipePreview[]>('/recipes/favorites').then((res) => res.data),
}));
