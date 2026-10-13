/* eslint-disable camelcase -- API schemas use snake_case. */
import { expect, it } from 'vitest'
import { h } from 'vue'

import type { MealSlot, MealType } from '@/modules/weeks/types'

import SlotCard from '@/modules/weeks/ui/SlotCard.vue'
import SlotGrid from '@/modules/weeks/ui/SlotGrid.vue'

import { mountComposable } from '../helpers/composable'
import { week } from '../helpers/fixtures'
import { uiStubs } from '../helpers/ui'

const slot = (
	mealType: MealType,
	recipe: MealSlot['recipe'] = null,
): MealSlot => ({
	id: mealType,
	day_of_week: 'MONDAY',
	meal_type: mealType,
	recipe,
})
const recipe: NonNullable<MealSlot['recipe']> = {
	id: 'recipe-1',
	name: 'Soup',
	author: 'Chef',
	is_favorite: false,
	image_url: '/soup.jpg',
}

it.each([
	{ recipe: null, filled: false, image: false },
	{ recipe, filled: true, image: true },
	{ recipe: { ...recipe, image_url: null }, filled: true, image: false },
])(
	'renders assigned recipes and their optional images: $filled / $image',
	({ recipe: assignment, filled, image }) => {
		const { wrapper } = mountComposable(() => null, {
			render: () => h(SlotCard, { mealSlot: slot('LUNCH', assignment) }),
			stubs: uiStubs,
		})
		expect(wrapper.get('.slot').classes().includes('slot--filled')).toBe(filled)
		expect(wrapper.find('img').exists()).toBe(image)
		expect(wrapper.text()).toContain('LUNCH')
		if (filled) expect(wrapper.text()).toContain('Soup')
		else expect(wrapper.find('.slot__portion').exists()).toBe(false)
		if (image) expect(wrapper.get('img').attributes('src')).toBe('/soup.jpg')
	},
)

it('sorts each day into meal order without modifying the API data', () => {
	const slots = [
		slot('DINNER'),
		slot('SNACK'),
		slot('BREAKFAST'),
		slot('LUNCH'),
	]
	const originalOrder = slots.map((item) => item.meal_type)
	const { wrapper } = mountComposable(() => null, {
		render: () =>
			h(SlotGrid, {
				week: { ...week(), week_days: [{ name: 'MONDAY', slots }] },
			}),
		stubs: uiStubs,
	})
	expect(wrapper.get('.meal-slot-grid__day-title').text()).toBe('MONDAY')
	expect(
		wrapper
			.findAllComponents(SlotCard)
			.map((card) => card.props('mealSlot').meal_type),
	).toEqual(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'])
	expect(slots.map((item) => item.meal_type)).toEqual(originalOrder)
})
