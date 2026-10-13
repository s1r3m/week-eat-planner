import { assert, expect, it } from 'vitest'
import { h } from 'vue'

import RecipeCreatePage from '@/pages/recipes/create.vue'

import { mountComposable } from '../helpers/composable'
import { DialogStub, uiStubs } from '../helpers/ui'

it('keeps a draft until clearing is confirmed, then resets the form and closes confirmation', async () => {
	const { wrapper } = mountComposable(() => null, {
		render: () => h(RecipeCreatePage),
		stubs: uiStubs,
	})
	const name = () => wrapper.get<HTMLInputElement>('input[type="text"]')
	const portions = () => wrapper.get<HTMLInputElement>('input[type="number"]')
	expect(name().element.value).toBe('')
	expect(portions().element.value).toBe('2')
	await name().setValue('Soup')
	await portions().setValue('4')
	const clear = wrapper
		.findAll('button')
		.find((button) => button.text() === 'Clear')
	assert.isDefined(clear)
	await clear.trigger('click')
	expect(wrapper.getComponent(DialogStub).props('modelValue')).toBe(true)
	expect(name().element.value).toBe('Soup')
	const confirm = wrapper
		.findAll('button')
		.find((button) => button.text() === 'Yes')
	assert.isDefined(confirm)
	await confirm.trigger('click')
	expect(name().element.value).toBe('')
	expect(portions().element.value).toBe('2')
	expect(wrapper.getComponent(DialogStub).props('modelValue')).toBe(false)
})

it('preserves the recipe draft when clearing is cancelled through the dialog model', async () => {
	const { wrapper } = mountComposable(() => null, {
		render: () => h(RecipeCreatePage),
		stubs: uiStubs,
	})
	await wrapper.get('input[type="text"]').setValue('Soup')
	await wrapper.get('button.btn--secondary').trigger('click')
	wrapper.getComponent(DialogStub).vm.$emit('update:modelValue', false)
	await wrapper.vm.$nextTick()
	expect(wrapper.getComponent(DialogStub).props('modelValue')).toBe(false)
	expect(
		wrapper.get<HTMLInputElement>('input[type="text"]').element.value,
	).toBe('Soup')
})
