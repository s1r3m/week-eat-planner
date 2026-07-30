/**
Publicly visible information about a user.
*/
export interface UserData {
	avatar_url: null | string
	email: string
	id: string
	is_active: boolean
	oauth_provider: null | string
	username: string
}

/**
Payload for updating user profile fields.
*/
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
