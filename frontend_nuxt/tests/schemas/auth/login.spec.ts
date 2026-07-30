import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { ref } from 'vue'

// Mock globals
// @ts-ignore
globalThis.ref = ref

const mockUseForm = mock(() => ({
	errors: ref({}),
	handleSubmit: mock((fn: any) => fn),
	meta: ref({}),
}))

const mockUseField = mock((name: string) => ({
	value: ref(''),
}))

mock.module('vee-validate', () => ({
	useForm: mockUseForm,
	useField: mockUseField,
}))

mock.module('@vee-validate/zod', () => ({
	toTypedSchema: mock((schema: any) => schema),
}))

const { useLoginValidation } = await import('@/schemas/auth/login')

describe('useLoginValidation', () => {
	beforeEach(() => {
		mockUseForm.mockClear()
		mockUseField.mockClear()
	})

	it('calls useForm with correct configuration', () => {
		useLoginValidation()
		expect(mockUseForm).toHaveBeenCalledWith(
			expect.objectContaining({
				initialValues: {
					email: '',
					password: '',
				},
			}),
		)
	})

	it('calls useField for email and password', () => {
		useLoginValidation()
		expect(mockUseField).toHaveBeenCalledWith('email')
		expect(mockUseField).toHaveBeenCalledWith('password')
	})

	it('returns the expected properties', () => {
		const result = useLoginValidation()
		expect(result).toHaveProperty('errors')
		expect(result).toHaveProperty('handleSubmit')
		expect(result).toHaveProperty('meta')
		expect(result).toHaveProperty('password')
		expect(result).toHaveProperty('username')
	})
})
