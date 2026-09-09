export const RECIPE_KEYS = {
	root: ['recipes'] as const,
	my: () => [...RECIPE_KEYS.root, 'my-recipes'] as const,
	detail: (id: string) => [...RECIPE_KEYS.root, 'detail', id] as const,
}
