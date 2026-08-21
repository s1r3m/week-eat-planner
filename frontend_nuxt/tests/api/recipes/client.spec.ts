import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { useRecipeApi } from '@/api/recipes/client'

const mockApi = mock()
// Mock useNuxtApp globally for tests
// @ts-ignore
globalThis.useNuxtApp = () => ({
	$api: mockApi,
})

describe('useRecipeApi', () => {
	beforeEach(() => {
		mockApi.mockClear()
	})

	const recipeApi = useRecipeApi()

	describe('getMyRecipes', () => {
		it('calls the /recipes/my_recipes endpoint with GET method', async () => {
			const mockResponse = [
				{
					id: '1',
					name: 'Recipe 1',
					author: 'user1',
					is_favorite: false,
					__pending: false,
				},
			]
			mockApi.mockResolvedValue(mockResponse)

			const result = await recipeApi.getMyRecipes()

			expect(mockApi).toHaveBeenCalledWith('/recipes/my_recipes')
			expect(result).toEqual(mockResponse)
		})
	})
})
