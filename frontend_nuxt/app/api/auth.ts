export interface LoginPayload {
	password: string
	username: string
}

export interface SuccessResponse {
	status: string
}

export const useAuthApi = () => {
	const { $api } = useNuxtApp()

	return {
		login: (payload: LoginPayload) => {
			const body = new URLSearchParams({ ...payload })
			return $api<SuccessResponse>('/auth/login', {
				body,
				method: 'POST',
			})
		},
		logout: () =>
			$api<void>('/auth/logout', {
				method: 'POST',
			}),
	}
}
