import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { ref } from 'vue'

// Mock globals
// @ts-ignore
globalThis.ref = ref

const mockLogin = mock()
const mockAuthStore = {
	login: mockLogin,
}

// @ts-ignore
globalThis.useAuthStore = () => mockAuthStore

const mockUsername = ref('')
const mockPassword = ref('')
const mockErrors = ref({})
const mockMeta = ref({})

const mockHandleSubmit = mock((fn: any) => {
	return () => fn({ email: mockUsername.value, password: mockPassword.value })
})

// Mock vee-validate
mock.module('vee-validate', () => ({
	useForm: () => ({
		errors: mockErrors,
		handleSubmit: mockHandleSubmit,
		meta: mockMeta,
	}),
	useField: (name: string) => {
		if (name === 'email') return { value: mockUsername }
		if (name === 'password') return { value: mockPassword }
		return { value: ref('') }
	},
}))

mock.module('@vee-validate/zod', () => ({
	toTypedSchema: mock((schema: any) => schema),
}))

const { useLoginForm } = await import('@/composables/auth/useLoginForm')

describe('useLoginForm', () => {
	beforeEach(() => {
		mockLogin.mockClear()
		mockHandleSubmit.mockClear()
		mockUsername.value = ''
		mockPassword.value = ''
		mockErrors.value = {}
		mockMeta.value = {}
	})

	it('initializes with default values', () => {
		const { email, isLoading, serverError } = useLoginForm()
		expect(email.value).toBe('')
		expect(isLoading.value).toBe(false)
		expect(serverError.value).toBeNull()
	})

	it('calls authStore.login on form submission', async () => {
		const { login, email, password } = useLoginForm()
		email.value = 'test@example.com'
		password.value = 'password'

		await login()

		expect(mockLogin).toHaveBeenCalledWith({
			username: 'test@example.com',
			password: 'password',
		})
	})

	it('handles successful login', async () => {
		const { login, isLoading, serverError } = useLoginForm()
		mockLogin.mockResolvedValueOnce({})

		const promise = login()
		expect(isLoading.value).toBe(true)
		await promise

		expect(isLoading.value).toBe(false)
		expect(serverError.value).toBeNull()
	})

	it('handles login failure with server error', async () => {
		const { login, isLoading, serverError, password } = useLoginForm()
		password.value = 'password'
		const errorResponse = {
			data: {
				detail: 'Invalid credentials',
			},
		}
		mockLogin.mockRejectedValueOnce(errorResponse)

		try {
			await login()
		} catch (e) {
			// Expected
		}

		expect(isLoading.value).toBe(false)
		expect(serverError.value).toBe('Invalid credentials')
		expect(password.value).toBe('')
	})

	it('handles login failure with generic error', async () => {
		const { login, serverError } = useLoginForm()
		mockLogin.mockRejectedValueOnce(new Error('Network error'))

		try {
			await login()
		} catch (e) {
			// Expected
		}

		expect(serverError.value).toBe('Something went wrong')
	})
})
