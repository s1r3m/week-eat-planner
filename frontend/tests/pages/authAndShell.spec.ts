import { flushPromises } from '@vue/test-utils'
import { Script } from 'node:vm'
import { assert, beforeEach, expect, it, vi } from 'vitest'
import { h } from 'vue'

import App from '@/app.vue'
import AuthLoginForm from '@/modules/auth/ui/AuthLoginForm.vue'
import AuthSignupForm from '@/modules/auth/ui/AuthSignupForm.vue'
import IndexPage from '@/pages/index.vue'
import LoginPage from '@/pages/login.vue'
import RecipesPage from '@/pages/my/recipes.vue'
import SignupPage from '@/pages/signup.vue'

import { mountComposable } from '../helpers/composable'
import { uiStubs } from '../helpers/ui'

beforeEach(() => {
	vi.stubGlobal('useRoute', () => ({ query: {} }))
})

it.each([
	{ redirect: '/my/recipes?q=1#top', expected: '/my/recipes?q=1#top' },
	{ redirect: '//external.test', expected: '/my/weeks' },
	{ redirect: undefined, expected: '/my/weeks' },
])(
	'returns a successful login to the safe target $expected',
	async ({ redirect, expected }) => {
		vi.stubGlobal('useRoute', () => ({ query: { redirect } }))
		const { wrapper } = mountComposable(() => null, {
			render: () => h(LoginPage),
			stubs: { AuthLoginForm: true },
		})
		expect(wrapper.get('h1').text()).toBe('Welcome back')
		wrapper.getComponent(AuthLoginForm).vm.$emit('success')
		await flushPromises()
		expect(navigateTo).toHaveBeenCalledExactlyOnceWith(expected)
	},
)

it('takes successful registration to the login page', async () => {
	const { wrapper } = mountComposable(() => null, {
		render: () => h(SignupPage),
		stubs: { AuthSignupForm: true },
	})
	expect(wrapper.get('h1').text()).toBe('Join us')
	wrapper.getComponent(AuthSignupForm).vm.$emit('success')
	await flushPromises()
	expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ name: 'login' })
})

it('starts planning from the landing page and leaves the unfinished demo control disabled', async () => {
	const { wrapper } = mountComposable(() => null, {
		render: () => h(IndexPage),
		stubs: uiStubs,
	})
	const [start, demo] = wrapper.findAll('button')
	assert.isDefined(start)
	assert.isDefined(demo)
	expect(start.text()).toBe('Start Planning')
	expect((demo.element as HTMLButtonElement).disabled).toBe(true)
	await start.trigger('click')
	expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ name: 'login' })
})

it('offers recipe creation from the current recipes placeholder page', () => {
	const { wrapper } = mountComposable(() => null, {
		render: () => h(RecipesPage),
		stubs: uiStubs,
	})
	expect(wrapper.get('h2').text()).toBe('My Recipes')
	expect(wrapper.get('button').attributes('aria-label')).toBe('Create recipe')
	expect(wrapper.find('.loading-state').exists()).toBe(false)
	expect(wrapper.find('.error-state').exists()).toBe(false)
})

it.each(['dark', 'light', null])(
	'installs and runs the early saved-theme script for %s',
	(savedTheme) => {
		const head = vi.fn()
		vi.stubGlobal('useHead', head)
		const { wrapper } = mountComposable(() => null, {
			render: () => h(App),
			stubs: {
				NuxtLayout: { template: '<section><slot /></section>' },
				NuxtPage: { template: '<main>Current page</main>' },
				ClientOnly: { template: '<slot />' },
				Teleport: true,
			},
		})
		expect(wrapper.get('main').text()).toBe('Current page')
		expect(head).toHaveBeenCalledTimes(1)
		const call = head.mock.calls[0]
		assert.isDefined(call)
		const { innerHTML: scriptBody, tagPriority } = call[0].script[0] as {
			innerHTML: string
			tagPriority: string
		}
		expect(tagPriority).toBe('critical')
		const getItem = vi.fn(() => savedTheme)
		const documentElement = document.createElement('html')
		const script = new Script(scriptBody)
		script.runInNewContext({
			localStorage: { getItem },
			document: { documentElement },
		})
		expect(getItem).toHaveBeenCalledExactlyOnceWith('wep-theme')
		if (savedTheme) {
			expect(documentElement.classList.contains(savedTheme)).toBe(true)
		} else {
			expect(documentElement.className).toBe('')
		}
	},
)
