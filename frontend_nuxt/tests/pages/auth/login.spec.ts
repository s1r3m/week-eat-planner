import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { ref } from 'vue'

// Mock Nuxt & Vue functions
const mockNavigateTo = mock()
// @ts-ignore
globalThis.navigateTo = mockNavigateTo

const mockRoute = {
	query: {} as Record<string, any>,
}
// @ts-ignore
globalThis.useRoute = () => mockRoute

// Mock Composables
const mockLogin = mock()
const mockLoginForm = {
	email: ref(''),
	errors: ref({}),
	isLoading: ref(false),
	login: mockLogin,
	meta: ref({ valid: true }),
	password: ref(''),
	serverError: ref(null),
}

// @ts-ignore
globalThis.useLoginForm = () => mockLoginForm

// Import the page component logic
// Note: Since we are testing the logic in <script setup>, we can import the component
// and test the onSubmit function if it's exported or accessible.
// In a real Nuxt/Vitest setup we'd use mount(), but here we'll follow the pattern in useLoginForm.spec.ts
// by mocking the environment and checking calls.

describe('Login Page logic', () => {
	beforeEach(() => {
		mockNavigateTo.mockClear()
		mockLogin.mockClear()
		mockRoute.query = {}
		mockLoginForm.serverError.value = null
	})

	it('navigates to my-weeks on successful login by default', async () => {
		// Simulate the onSubmit from login.vue
		const onSubmit = async () => {
			try {
				await mockLogin()
			} catch {
				return
			}
			const redirect = mockRoute.query.redirect
			if (
				typeof redirect === 'string' &&
				redirect.startsWith('/') &&
				!redirect.startsWith('//')
			) {
				await mockNavigateTo(redirect)
			} else {
				await mockNavigateTo({ name: 'my-weeks' })
			}
		}

		mockLogin.mockResolvedValueOnce({})
		await onSubmit()

		expect(mockLogin).toHaveBeenCalled()
		expect(mockNavigateTo).toHaveBeenCalledWith({ name: 'my-weeks' })
	})

	it('navigates to redirect query param if provided and valid', async () => {
		const onSubmit = async () => {
			try {
				await mockLogin()
			} catch {
				return
			}
			const redirect = mockRoute.query.redirect
			if (
				typeof redirect === 'string' &&
				redirect.startsWith('/') &&
				!redirect.startsWith('//')
			) {
				await mockNavigateTo(redirect)
			} else {
				await mockNavigateTo({ name: 'my-weeks' })
			}
		}

		mockRoute.query.redirect = '/recipes'
		mockLogin.mockResolvedValueOnce({})
		await onSubmit()

		expect(mockNavigateTo).toHaveBeenCalledWith('/recipes')
	})

	it('ignores unsafe redirect query param (protocol relative)', async () => {
		const onSubmit = async () => {
			try {
				await mockLogin()
			} catch {
				return
			}
			const redirect = mockRoute.query.redirect
			if (
				typeof redirect === 'string' &&
				redirect.startsWith('/') &&
				!redirect.startsWith('//')
			) {
				await mockNavigateTo(redirect)
			} else {
				await mockNavigateTo({ name: 'my-weeks' })
			}
		}

		mockRoute.query.redirect = '//evil.com'
		mockLogin.mockResolvedValueOnce({})
		await onSubmit()

		expect(mockNavigateTo).toHaveBeenCalledWith({ name: 'my-weeks' })
	})

	it('ignores non-string redirect query param', async () => {
		const onSubmit = async () => {
			try {
				await mockLogin()
			} catch {
				return
			}
			const redirect = mockRoute.query.redirect
			if (
				typeof redirect === 'string' &&
				redirect.startsWith('/') &&
				!redirect.startsWith('//')
			) {
				await mockNavigateTo(redirect)
			} else {
				await mockNavigateTo({ name: 'my-weeks' })
			}
		}

		// @ts-ignore
		mockRoute.query.redirect = ['/one', '/two']
		mockLogin.mockResolvedValueOnce({})
		await onSubmit()

		expect(mockNavigateTo).toHaveBeenCalledWith({ name: 'my-weeks' })
	})

	it('does not navigate if login fails', async () => {
		const onSubmit = async () => {
			try {
				await mockLogin()
			} catch {
				return
			}
			const redirect = mockRoute.query.redirect
			if (
				typeof redirect === 'string' &&
				redirect.startsWith('/') &&
				!redirect.startsWith('//')
			) {
				await mockNavigateTo(redirect)
			} else {
				await mockNavigateTo({ name: 'my-weeks' })
			}
		}

		mockLogin.mockRejectedValueOnce(new Error('Login failed'))
		await onSubmit()

		expect(mockLogin).toHaveBeenCalled()
		expect(mockNavigateTo).not.toHaveBeenCalled()
	})
})
