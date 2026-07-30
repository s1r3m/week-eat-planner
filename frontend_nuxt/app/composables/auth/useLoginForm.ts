import type { ErrorResponse } from '@/schemas/api'

import { useLoginValidation } from '@/schemas/auth/login'

export const useLoginForm = () => {
	const authStore = useAuthStore()
	const { email, errors, handleSubmit, meta, password } = useLoginValidation()

	const isLoading = ref<boolean>(false)
	const serverError = ref<null | string>(null)

	const login = handleSubmit(async (values) => {
		isLoading.value = true
		serverError.value = null

		try {
			serverError.value = null
			await authStore.login({
				password: values.password,
				username: values.email,
			})
		} catch (error) {
			password.value = ''

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
		login,
		meta,
		password,
		serverError,
	}
}
