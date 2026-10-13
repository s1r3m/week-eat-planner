import { AlertDialogRoot, DialogRoot, DropdownMenuContent } from 'reka-ui'
import { expect, it } from 'vitest'
import { h, nextTick, ref, toValue } from 'vue'

import BaseAlertDialog from '@/common/ui/BaseAlertDialog.vue'
import BaseDialog from '@/common/ui/BaseDialog.vue'
import BaseDropdown from '@/common/ui/BaseDropdown.vue'
import BaseSidePanel from '@/common/ui/BaseSidePanel.vue'

import { mountComposable } from '../helpers/composable'

const passthrough = { template: '<div><slot /></div>' }
const stubs = {
	ClientOnly: passthrough,
	DialogPortal: passthrough,
	AlertDialogPortal: passthrough,
	DropdownMenuPortal: passthrough,
	DialogContent: passthrough,
	AlertDialogContent: passthrough,
	DropdownMenuContent: { ...passthrough, props: ['align', 'sideOffset'] },
	Icon: true,
}

it.each([undefined, 'Helpful description'])(
	'renders dialog content and an optional description: %s',
	async (description) => {
		const open = ref(true)
		const { wrapper } = mountComposable(() => null, {
			render: () =>
				h(
					BaseDialog,
					{
						title: 'Edit week',
						description,
						modelValue: open.value,
						'onUpdate:modelValue': (value) => {
							open.value = value
						},
					},
					() => 'Draft fields',
				),
			stubs,
		})
		expect(wrapper.get('.base-dialog__title').text()).toBe('Edit week')
		expect(wrapper.text()).toContain('Draft fields')
		expect(wrapper.find('.base-dialog__description').exists()).toBe(
			!!description,
		)
		wrapper.getComponent(DialogRoot).vm.$emit('update:open', false)
		await nextTick()
		expect(toValue(open)).toBe(false)
		expect(
			wrapper.getComponent(BaseDialog).emitted('update:modelValue'),
		).toEqual([[false]])
	},
)

it.each([false, true])(
	'keeps an alert dialog title accessible when hidden=%s',
	async (titleHidden) => {
		const open = ref(true)
		const { wrapper } = mountComposable(() => null, {
			render: () =>
				h(
					BaseAlertDialog,
					{
						title: 'Delete week',
						description: 'This removes the selected week.',
						titleHidden,
						modelValue: open.value,
						'onUpdate:modelValue': (value) => {
							open.value = value
						},
					},
					() => h('button', 'Confirm'),
				),
			stubs,
		})
		expect(wrapper.text()).toContain('Delete week')
		expect(wrapper.get('.alert-dialog__description').text()).toBe(
			'This removes the selected week.',
		)
		expect(wrapper.get('button').text()).toBe('Confirm')
		wrapper.getComponent(AlertDialogRoot).vm.$emit('update:open', false)
		await nextTick()
		expect(toValue(open)).toBe(false)
	},
)

it('renders a side panel with title, content, footer, and a close control', async () => {
	const open = ref(true)
	const { wrapper } = mountComposable(() => null, {
		render: () =>
			h(
				BaseSidePanel,
				{
					modelValue: open.value,
					'onUpdate:modelValue': (value) => {
						open.value = value
					},
				},
				{
					title: () => 'Navigation',
					default: () => 'Links',
					footer: () => 'User menu',
				},
			),
		stubs,
	})
	expect(wrapper.text()).toContain('Navigation')
	expect(wrapper.get('.side-panel__content').text()).toContain('Links')
	expect(wrapper.get('.side-panel__content').text()).toContain('User menu')
	await wrapper.get('button[aria-label="close"]').trigger('click')
	await nextTick()
	expect(toValue(open)).toBe(false)
})

it.each([undefined, 'start'] as const)(
	'passes dropdown placement and custom classes to its menu: %s',
	(align) => {
		const { wrapper } = mountComposable(() => null, {
			render: () =>
				h(
					BaseDropdown,
					{ align, contentClass: 'custom-menu' },
					{
						trigger: () => h('button', 'Open menu'),
						default: () => 'Choices',
					},
				),
			stubs,
		})
		expect(wrapper.get('button').text()).toBe('Open menu')
		expect(wrapper.getComponent(DropdownMenuContent).props('align')).toBe(
			align ?? 'end',
		)
		expect(wrapper.getComponent(DropdownMenuContent).props('sideOffset')).toBe(
			8,
		)
		expect(wrapper.get('.dropdown').classes()).toContain('custom-menu')
		expect(wrapper.text()).toContain('Choices')
	},
)
