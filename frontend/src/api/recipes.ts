import { defineQueryOptions } from '@pinia/colada';
import { apiClient } from './client';
import type { RecipeFull, RecipeMinimal } from '@/domain/recipe/models';

export const RECIPE_KEYS = {
  root: ['recipes'] as const,
  all: () => [...RECIPE_KEYS.root, 'list'] as const,
  detail: (id: string) => [...RECIPE_KEYS.root, 'detail', id] as const,
};

export const getRecipesQuery = defineQueryOptions(() => ({
  key: RECIPE_KEYS.all(),
  query: () => apiClient.get<RecipeMinimal[]>('/recipes').then((res) => res.data),
}));

export const getRecipeQuery = defineQueryOptions((id: string) => ({
  key: RECIPE_KEYS.detail(id),
  query: () => apiClient.get<RecipeFull>(`/recipes/${id}`).then((res) => res.data),
}));
