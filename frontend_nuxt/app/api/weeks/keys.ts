export const WEEK_KEYS = {
	root: ['weeks'] as const,
	all: () => [...WEEK_KEYS.root, 'list'] as const,
	detail: (id: string) => [...WEEK_KEYS.root, 'detail', id] as const,
	shoppingList: (id: string) =>
		[...WEEK_KEYS.root, 'shopping-list', id] as const,
}
