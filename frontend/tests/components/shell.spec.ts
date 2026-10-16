import { flushPromises } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { h, ref } from 'vue'

import BaseSidePanel from '@/common/ui/BaseSidePanel.vue'
import DefaultLayout from '@/core/layouts/default.vue'
import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
import AppAuthControls from '@/modules/main/ui/AppAuthControls.vue'
import AppHeader from '@/modules/main/ui/AppHeader.vue'
import AppLogo from '@/modules/main/ui/AppLogo.vue'
import AppMobileSidePanel from '@/modules/main/ui/AppMobileSidePanel.vue'
import AppNavigation from '@/modules/main/ui/AppNavigation.vue'
import AppUser from '@/modules/main/ui/AppUser.vue'
import GuestMobileSidePanel from '@/modules/main/ui/GuestMobileSidePanel.vue'

import { mountComposable } from '../helpers/composable'
import { uiStubs } from '../helpers/ui'

const stubs = {
	...uiStubs,
	NuxtLink: { ...uiStubs.NuxtLink, props: ['to'] },
	ModeSwitch: true,
	AppAuthControls: true,
	AppNavigation: true,
	AppUser: true,
	BaseSidePanel: {
		props: ['modelValue'],
		emits: ['update:modelValue'],
		template:
			'<aside><slot name="title" /><slot /><slot name="footer" /></aside>',
	},
}

it('links the logo home, emits navigation, and updates its collapsed title', async () => {
	const collapsed = ref<boolean | undefined>(undefined)
	const { wrapper } = mountComposable(() => null, {
		render: () => h(AppLogo, { collapsed: collapsed.value }),
		stubs,
	})
	expect(wrapper.getComponent(stubs.NuxtLink).props('to')).toEqual({
		name: 'index',
	})
	expect(wrapper.get('h1').text()).toBe('Week Eat Planner')
	expect(wrapper.get('h1').classes()).not.toContain('app_logo__title--collaped')
	expect(wrapper.get('img').attributes('aria-hidden')).toBe('true')
	await wrapper.get('a').trigger('click')
	expect(wrapper.getComponent(AppLogo).emitted('navigate')).toEqual([[]])
	collapsed.value = true
	await flushPromises()
	expect(wrapper.get('h1').classes()).toContain('app_logo__title--collaped')
})

it('opens the header menu and closes it after logo or authentication navigation', async () => {
	const { wrapper, result: sidebar } = mountComposable(useMobileSidebar, {
		render: () => h(AppHeader),
		stubs: { ...stubs, AppLogo: true, GuestMobileSidePanel: true },
	})
	const menu = wrapper.get('button[aria-label="Open mobile menu"]')
	await menu.trigger('click')
	expect(sidebar.isOpen.value).toBe(true)
	wrapper.getComponent(AppLogo).vm.$emit('navigate')
	expect(sidebar.isOpen.value).toBe(false)
	await menu.trigger('click')
	wrapper.getComponent(AppAuthControls).vm.$emit('navigate')
	expect(sidebar.isOpen.value).toBe(false)
	expect(wrapper.findComponent(GuestMobileSidePanel).exists()).toBe(true)
})

it.each([
	{
		name: 'guest',
		component: GuestMobileSidePanel,
		controls: [AppLogo, AppAuthControls],
	},
	{
		name: 'authenticated',
		component: AppMobileSidePanel,
		controls: [AppLogo, AppNavigation, AppUser],
	},
])(
	'shares $name panel state and closes after each navigation action',
	async ({ component, controls }) => {
		const { wrapper, result: sidebar } = mountComposable(useMobileSidebar, {
			render: () => h(component),
			stubs: { ...stubs, AppLogo: true },
		})
		const panel = wrapper.getComponent(BaseSidePanel)
		expect(panel.props('modelValue')).toBe(false)
		for (const control of controls) {
			sidebar.open()
			await flushPromises()
			expect(panel.props('modelValue')).toBe(true)
			wrapper.getComponent(control).vm.$emit('navigate')
			await flushPromises()
			expect(sidebar.isOpen.value).toBe(false)
			expect(panel.props('modelValue')).toBe(false)
		}
		panel.vm.$emit('update:modelValue', true)
		await flushPromises()
		expect(sidebar.isOpen.value).toBe(true)
		panel.vm.$emit('update:modelValue', false)
		await flushPromises()
		expect(sidebar.isOpen.value).toBe(false)
	},
)

it('renders the default layout header, content slot, and footer credits', () => {
	const { wrapper } = mountComposable(() => null, {
		render: () => h(DefaultLayout, null, () => h('p', 'Page content')),
		stubs: { AppHeader: true },
	})
	expect(wrapper.findComponent(AppHeader).exists()).toBe(true)
	expect(wrapper.get('main').text()).toBe('Page content')
	expect(wrapper.get('footer').text()).toContain('© 2026 Week Eat Planner')
	expect(wrapper.get('footer').text()).toContain('Design by s1r3m')
})
