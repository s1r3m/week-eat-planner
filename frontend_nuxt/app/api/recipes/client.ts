export const useRecipeApi = () => {
	const { $api } = useNuxtApp()

	return {
		getMyRecipes: async () => $api<IRecipeInfo[]>('/recipes/my_recipes'),
	}
}
