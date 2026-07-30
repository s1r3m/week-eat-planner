import type { ErrorResponse } from '@/schemas/api'

import { useSignupValidation } from '@/schemas/auth/signup'

export const useSignupForm = () => {
	const authStore = useAuthStore()
	const { email, errors, handleSubmit, meta, password, username } =
		useSignupValidation()

	const isLoading = ref<boolean>(false)
	const serverError = ref<null | string>(null)

	const register = handleSubmit(async (values) => {
		isLoading.value = true
		serverError.value = null

		try {
			await authStore.signup({
				email: values.email,
				password: values.password,
				username: values.username,
			})
		} catch (error) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'data' in error &&
				error.data
			) {
				const body = error.data as ErrorResponse
				serverError.value = body.detail
			} else {
				serverError.value = 'Something went wrong'
			}

			throw error
		} finally {
			isLoading.value = false
		}
	})

	return {
		email,
		errors,
		isLoading,
		meta,
		password,
		register,
		serverError,
		username,
	}
}
