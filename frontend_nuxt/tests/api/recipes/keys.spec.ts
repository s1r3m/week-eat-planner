import { describe, expect, it } from 'bun:test'
import { RECIPE_KEYS } from '@/api/recipes/keys'

describe('RECIPE_KEYS', () => {
	it('defines the correct root key', () => {
		expect(RECIPE_KEYS.root).toEqual(['recipes'])
	})

	it('defines the correct my recipes key', () => {
		expect(RECIPE_KEYS.my()).toEqual(['recipes', 'my-recipes'])
	})

	it('defines the correct detail key', () => {
		const id = '123'
		expect(RECIPE_KEYS.detail(id)).toEqual(['recipes', 'detail', id])
	})
})
