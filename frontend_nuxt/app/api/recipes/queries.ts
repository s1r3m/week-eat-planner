export const getMyRecipesQuery = defineQueryOptions(() => ({
	key: RECIPE_KEYS.my(),
	query: () => useRecipeApi().getMyRecipes(),
}))
