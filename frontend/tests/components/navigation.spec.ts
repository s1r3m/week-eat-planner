import { flushPromises } from '@vue/test-utils'
import { assert, beforeEach, expect, it, vi } from 'vitest'
import { computed, h, reactive, ref } from 'vue'

import { AUTH_KEY } from '@/modules/auth/constants'
import * as navigation from '@/modules/main/composables/useAppNavigation'
import AppAuthControls from '@/modules/main/ui/AppAuthControls.vue'
import AppNavigation from '@/modules/main/ui/AppNavigation.vue'
import AppUser from '@/modules/main/ui/AppUser.vue'
import ModeSwitch from '@/modules/main/ui/ModeSwitch.vue'
import { WEEKS_KEY } from '@/modules/weeks/constants'

import { mountComposable } from '../helpers/composable'
import { user, week } from '../helpers/fixtures'
import { uiStubs } from '../helpers/ui'

const api = vi.fn()
const route = reactive({ name: 'index' })
const colorMode = reactive({ value: 'light', preference: 'system' })
const stubs = {
	...uiStubs,
	ClientOnly: { template: '<slot />' },
	BaseDropdown: { template: '<div><slot name="trigger" /><slot /></div>' },
	DropdownMenuItem: { template: '<button type="button"><slot /></button>' },
	BaseSidePanel: {
		props: ['modelValue'],
		emits: ['update:modelValue'],
		template:
			'<aside><slot name="title" /><slot /><slot name="footer" /></aside>',
	},
}
beforeEach(() => {
	route.name = 'index'
	colorMode.value = 'light'
	colorMode.preference = 'system'
	api.mockReset().mockResolvedValue(null)
	vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
	vi.stubGlobal('useRoute', () => route)
	vi.stubGlobal('useColorMode', () => colorMode)
})

it('hides the current authentication route and emits navigation after it finishes', async () => {
	const pending = Promise.withResolvers<undefined>()
	vi.stubGlobal(
		'navigateTo',
		vi.fn(() => pending.promise),
	)
	const { wrapper } = mountComposable(() => null, {
		render: () => h(AppAuthControls),
		stubs,
	})
	await flushPromises()
	expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
		'Login',
		'Register',
	])
	await wrapper.get('button').trigger('click')
	expect(
		wrapper.getComponent(AppAuthControls).emitted('navigate'),
	).toBeUndefined()
	pending.resolve(undefined)
	await flushPromises()
	expect(navigateTo).toHaveBeenCalledWith({ name: 'login' })
	expect(
		wrapper.getComponent(AppAuthControls).emitted('navigate'),
	).toHaveLength(1)
	route.name = 'login'
	await flushPromises()
	expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
		'Register',
	])
	await wrapper.get('button').trigger('click')
	await flushPromises()
	expect(navigateTo).toHaveBeenCalledWith({ name: 'signup' })
	route.name = 'signup'
	await flushPromises()
	expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
		'Login',
	])
})

it('logs out from the authenticated controls and displays its pending state', async () => {
	const response = Promise.withResolvers<null>()
	api.mockReturnValue(response.promise)
	const { wrapper } = mountComposable(() => null, {
		render: () => h(AppAuthControls),
		stubs,
		seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
	})
	await wrapper.get('button').trigger('click')
	expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ name: 'index' })
	expect(wrapper.get('button').text()).toBe('Logging out...')
	expect((wrapper.get('button').element as HTMLButtonElement).disabled).toBe(
		true,
	)
	expect(wrapper.getComponent(AppAuthControls).emitted('navigate')).toEqual([
		[],
	])
	response.resolve(null)
	await flushPromises()
	expect(wrapper.findAll('button').map((button) => button.text())).toEqual([
		'Login',
		'Register',
	])
	expect((wrapper.get('button').element as HTMLButtonElement).disabled).toBe(
		false,
	)
})

it('switches between light, dark, and system preferences and updates selected choices', async () => {
	const { wrapper } = mountComposable(() => null, {
		render: () => h(ModeSwitch),
		stubs,
	})
	for (const [index, preference] of ['dark', 'light', 'system'].entries()) {
		const choice = wrapper.findAll('button.dropdown__item')[index]
		assert.isDefined(choice)
		await choice.trigger('click')
		expect(colorMode.preference).toBe(preference)
		expect(wrapper.findAll('.dropdown__item--selected')).toHaveLength(1)
	}
	colorMode.value = 'dark'
	await flushPromises()
	expect(wrapper.html()).toContain('lucide:moon')
})

it('renders user data and navigates home only after successful logout', async () => {
	const response = Promise.withResolvers<null>()
	api.mockReturnValue(response.promise)
	const collapsed = ref(false)
	const { wrapper, cache } = mountComposable(() => null, {
		render: () => h(AppUser, { collapsed: collapsed.value }),
		stubs,
		seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
	})
	expect(wrapper.get('.user-info__name').text()).toBe(user.username)
	collapsed.value = true
	await flushPromises()
	expect(wrapper.get('.user-info__name').classes()).toContain(
		'user-info__name--collapsed',
	)
	await wrapper.get('button').trigger('click')
	await flushPromises()
	expect(wrapper.text()).toContain('Logging out...')
	expect(navigateTo).not.toHaveBeenCalled()
	response.resolve(null)
	await flushPromises()
	expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ name: 'index' })
	expect(wrapper.getComponent(AppUser).emitted('navigate')).toHaveLength(1)
	cache.setQueryData(AUTH_KEY.user(), null)
	await flushPromises()
	expect(wrapper.find('.user-info').exists()).toBe(false)
})

it('keeps the current route and emits no navigation when logout fails', async () => {
	api.mockImplementation((path) =>
		path === '/user'
			? Promise.resolve(user)
			: Promise.reject(new Error('Logout failed')),
	)
	const { wrapper } = mountComposable(() => null, {
		render: () => h(AppUser),
		stubs,
		seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
	})
	await wrapper.get('button').trigger('click')
	await flushPromises()
	expect(navigateTo).not.toHaveBeenCalled()
	expect(wrapper.getComponent(AppUser).emitted('navigate')).toBeUndefined()
	expect(wrapper.text()).toContain('Logout')
})

it('renders an optional navigation item without requiring an icon or children', () => {
	vi.spyOn(navigation, 'useAppNavigation').mockReturnValueOnce({
		navLinks: computed(() => [
			{ id: 'custom', title: 'Settings', to: '/settings' },
		]),
	})
	const { wrapper } = mountComposable(() => null, {
		render: () => h(AppNavigation),
		stubs,
	})
	expect(wrapper.get('a').text()).toBe('Settings')
	expect(wrapper.find('icon-stub').exists()).toBe(false)
	expect(wrapper.find('.nav__children').exists()).toBe(false)
})

it('renders week links, emits navigation, and hides children when collapsed', async () => {
	const collapsed = ref(false)
	const { wrapper, cache } = mountComposable(() => null, {
		render: () => h(AppNavigation, { collapsed: collapsed.value }),
		stubs,
		seed: (cache) => cache.setQueryData(WEEKS_KEY.all(), [week()]),
	})
	const component = wrapper.getComponent(AppNavigation)
	expect(wrapper.get('.nav__children').text()).toBe('Week one')
	expect(
		wrapper.findAll('icon-stub').map((icon) => icon.attributes('name')),
	).toEqual(['lucide:calendar-days', 'lucide:chevron-down', 'lucide:utensils'])
	await wrapper.get('.nav__link-collapse-btn').trigger('click')
	expect(component.emitted('navigate')).toBeUndefined()
	await wrapper.get('.nav__link').trigger('click')
	await wrapper.get('.nav__children .nav__link').trigger('click')
	expect(component.emitted('navigate')).toEqual([[], []])
	collapsed.value = true
	await flushPromises()
	expect(wrapper.find('.nav__children').exists()).toBe(false)
	expect(wrapper.find('.nav__link-collapse-btn').exists()).toBe(false)
	expect(wrapper.findAll('.nav__title--collapsed')).toHaveLength(2)
	collapsed.value = false
	cache.setQueryData(WEEKS_KEY.all(), [])
	await flushPromises()
	expect(wrapper.find('.nav__children').exists()).toBe(false)
	expect(wrapper.find('.nav__link-collapse-btn').exists()).toBe(true)
})

it('renders a neutral theme icon during the ClientOnly placeholder phase', () => {
	const { wrapper } = mountComposable(() => null, {
		render: () => h(ModeSwitch),
		stubs: {
			...stubs,
			ClientOnly: { template: '<slot name="placeholder" />' },
		},
	})
	expect(wrapper.get('button.btn--icon icon-stub').attributes('name')).toBe(
		'lucide:palette',
	)
})
