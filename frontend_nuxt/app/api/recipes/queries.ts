import { useRecipeApi } from './client'

export const getMyRecipesQuery = defineQueryOptions(() => ({
	key: RECIPE_KEYS.my(),
	query: () => useRecipeApi().getMyRecipes(),
}))
