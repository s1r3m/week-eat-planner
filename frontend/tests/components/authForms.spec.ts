import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { h } from 'vue'

import AuthLoginForm from '@/modules/auth/ui/AuthLoginForm.vue'
import AuthSignupForm from '@/modules/auth/ui/AuthSignupForm.vue'

import { mountComposable } from '../helpers/composable'
import { user } from '../helpers/fixtures'
import { uiStubs } from '../helpers/ui'

const api = vi.fn()
beforeEach(() => {
	api.mockReset()
	vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

it.each([
	{ name: 'login', component: AuthLoginForm, label: 'Login' },
	{ name: 'signup', component: AuthSignupForm, label: 'Register' },
])(
	'validates, reveals the password, and emits success only after $name completes',
	async ({ component, label }) => {
		const response = Promise.withResolvers<typeof user>()
		api.mockReturnValue(response.promise)
		const { wrapper } = mountComposable(() => null, {
			render: () => h(component),
			stubs: uiStubs,
		})
		const form = wrapper.getComponent(component)
		await vi.waitFor(() =>
			expect(
				wrapper.get<HTMLButtonElement>('button[type="submit"]').element
					.disabled,
			).toBe(true),
		)
		await wrapper.get('form').trigger('submit')
		await flushPromises()
		expect(api).not.toHaveBeenCalled()
		await vi.waitFor(() => expect(wrapper.text()).toContain('This is required'))
		await wrapper.get('input[placeholder="Enter email"]').setValue(user.email)
		const username = wrapper.find('input[placeholder="Enter username"]')
		if (username.exists()) await username.setValue(user.username)
		await wrapper
			.get('input[placeholder="Enter password"]')
			.setValue('password123')
		const toggle = wrapper.get(
			'button[aria-label="Toggle password visibility"]',
		)
		await toggle.trigger('click')
		expect(
			wrapper.get('input[placeholder="Enter password"]').attributes('type'),
		).toBe('text')
		expect(toggle.attributes('aria-pressed')).toBe('true')
		await toggle.trigger('click')
		expect(
			wrapper.get('input[placeholder="Enter password"]').attributes('type'),
		).toBe('password')
		await wrapper.get('form').trigger('submit')
		await flushPromises()
		expect(
			wrapper.get<HTMLButtonElement>('button[type="submit"]').element.disabled,
		).toBe(true)
		await vi.waitFor(() => expect(api).toHaveBeenCalledTimes(1))
		expect(form.emitted('success')).toBeUndefined()
		response.resolve(user)
		await flushPromises()
		await vi.waitFor(() => expect(form.emitted('success')).toHaveLength(1))
		expect(wrapper.get('button[type="submit"]').text()).toBe(label)
	},
)

it.each([AuthLoginForm, AuthSignupForm])(
	'shows and dismisses server failures without emitting success',
	async (component) => {
		api.mockRejectedValue({ data: { detail: 'Request failed' } })
		const { wrapper } = mountComposable(() => null, {
			render: () => h(component),
			stubs: uiStubs,
		})
		await wrapper.get('input[placeholder="Enter email"]').setValue(user.email)
		const username = wrapper.find('input[placeholder="Enter username"]')
		if (username.exists()) await username.setValue(user.username)
		await wrapper
			.get('input[placeholder="Enter password"]')
			.setValue('password123')
		await wrapper.get('form').trigger('submit')
		await flushPromises()
		await vi.waitFor(() =>
			expect(wrapper.get('[role="alert"]').text()).toContain('Request failed'),
		)
		expect(wrapper.getComponent(component).emitted('success')).toBeUndefined()
		await wrapper.get('button[aria-label="Close alert"]').trigger('click')
		expect(wrapper.find('[role="alert"]').exists()).toBe(false)
	},
)
