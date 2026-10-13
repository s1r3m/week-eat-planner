import { expect, it } from 'vitest'

import { createEmptyForm } from '@/modules/recipes/utils'

it('creates independent recipe drafts with their default portions', () => {
	const first = createEmptyForm()
	const second = createEmptyForm()
	expect(first).toEqual({ name: '', portions: 2, ingredients: [], steps: [] })
	first.name = 'Changed'
	expect(second.name).toBe('')
	expect(first.ingredients).not.toBe(second.ingredients)
	expect(first.steps).not.toBe(second.steps)
})
