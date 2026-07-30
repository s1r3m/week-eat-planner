import type { ErrorResponse } from '@/schemas/api'

import { useLoginValidation } from '@/schemas/auth/login'

export const useLoginForm = () => {
	const authStore = useAuthStore()
	const { errors, handleSubmit, meta, password, username } =
		useLoginValidation()

	const isLoading = ref<boolean>(false)
	const serverError = ref<null | string>(null)

	const login = handleSubmit(async () => {
		try {
			isLoading.value = true
			serverError.value = null
			await authStore.login({
				password: password.value,
				username: username.value,
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
		email: username,
		errors,
		isLoading,
		login,
		meta,
		password,
		serverError,
	}
}
