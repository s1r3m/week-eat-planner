import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { RECIPE_KEYS } from '@/api/recipes/keys'

const mockGetMyRecipes = mock()

beforeEach(() => {
	mockGetMyRecipes.mockClear()
})

// Set globals for the source file to use.
// @ts-ignore
globalThis.RECIPE_KEYS = RECIPE_KEYS
// @ts-ignore
globalThis.useRecipeApi = () => ({
	getMyRecipes: mockGetMyRecipes,
})
// @ts-ignore
globalThis.defineQueryOptions = (fn) => {
	const f = (...args: any[]) => fn(...args)
	// Add key and query methods for testing convenience
	f.key = () => fn().key
	f.query = () => fn().query
	return f
}

// We use dynamic import because defineQueryOptions and other globals are used at top level.
const { getMyRecipesQuery } = (await import('@/api/recipes/queries')) as any

describe('getMyRecipesQuery', () => {
	it('defines the query with correct key', () => {
		expect(getMyRecipesQuery().key).toEqual(RECIPE_KEYS.my())
	})

	it('defines the query with correct function', async () => {
		const mockData = [{ id: '1', name: 'Recipe 1' }]
		mockGetMyRecipes.mockResolvedValue(mockData)

		const result = await getMyRecipesQuery().query()

		expect(mockGetMyRecipes).toHaveBeenCalled()
		expect(result).toEqual(mockData)
	})
})
