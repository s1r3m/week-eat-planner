export interface UserData {
	avatar_url: null | string
	email: string
	id: string
	is_active: boolean
	oauth_provider: null | string
	username: string
}

export interface UserPayload {
	/** The new username to set. */
	username: string
}

export const useUserApi = () => {
	const { $api } = useNuxtApp()

	return {
		getUser: () => $api<UserData>('/user'),
	}
}
