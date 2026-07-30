import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { ref } from 'vue'

// Mock globals
// @ts-ignore
globalThis.ref = ref

const mockSignup = mock()
const mockAuthStore = {
	signup: mockSignup,
}

// @ts-ignore
globalThis.useAuthStore = () => mockAuthStore

const mockEmail = ref('')
const mockUsername = ref('')
const mockPassword = ref('')
const mockErrors = ref({})
const mockMeta = ref({})

const mockHandleSubmit = mock((fn: any) => {
	return () =>
		fn({
			email: mockEmail.value,
			password: mockPassword.value,
			username: mockUsername.value,
		})
})

// Mock vee-validate (same as in useLoginForm.spec.ts)
mock.module('vee-validate', () => ({
	useForm: () => ({
		errors: mockErrors,
		handleSubmit: mockHandleSubmit,
		meta: mockMeta,
	}),
	useField: (name: string) => {
		if (name === 'email') return { value: mockEmail }
		if (name === 'username') return { value: mockUsername }
		if (name === 'password') return { value: mockPassword }
		return { value: ref('') }
	},
}))

mock.module('@vee-validate/zod', () => ({
	toTypedSchema: mock((schema: any) => schema),
}))

const { useSignupForm } = await import('@/composables/auth/useSignupForm')

describe('useSignupForm', () => {
	beforeEach(() => {
		mockSignup.mockClear()
		mockHandleSubmit.mockClear()
		mockEmail.value = ''
		mockUsername.value = ''
		mockPassword.value = ''
		mockErrors.value = {}
		mockMeta.value = {}
	})

	it('initializes with default values', () => {
		const { email, username, isLoading, serverError } = useSignupForm()
		expect(email.value).toBe('')
		expect(username.value).toBe('')
		expect(isLoading.value).toBe(false)
		expect(serverError.value).toBeNull()
	})

	it('calls authStore.signup on form submission', async () => {
		const { register, email, username, password } = useSignupForm()
		email.value = 'test@example.com'
		username.value = 'testuser'
		password.value = 'password123'

		await register()

		expect(mockSignup).toHaveBeenCalledWith({
			email: 'test@example.com',
			username: 'testuser',
			password: 'password123',
		})
	})

	it('handles successful registration', async () => {
		const { register, isLoading, serverError } = useSignupForm()
		mockSignup.mockResolvedValueOnce({})

		const promise = register()
		expect(isLoading.value).toBe(true)
		await promise

		expect(isLoading.value).toBe(false)
		expect(serverError.value).toBeNull()
	})

	it('handles registration failure with server error', async () => {
		const { register, isLoading, serverError } = useSignupForm()
		const errorResponse = {
			data: {
				detail: 'User already exists',
			},
		}
		mockSignup.mockRejectedValueOnce(errorResponse)

		try {
			await register()
		} catch (e) {
			// Expected
		}

		expect(isLoading.value).toBe(false)
		expect(serverError.value).toBe('User already exists')
	})

	it('handles registration failure with generic error', async () => {
		const { register, serverError } = useSignupForm()
		mockSignup.mockRejectedValueOnce(new Error('Network error'))

		try {
			await register()
		} catch (e) {
			// Expected
		}

		expect(serverError.value).toBe('Something went wrong')
	})
})
