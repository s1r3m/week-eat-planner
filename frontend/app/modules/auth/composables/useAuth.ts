import type { AuthState } from '@/modules/auth/types'

import { getUser } from '@/modules/auth/api/authApi'

export const useAuth = () => {
	const { data: user, status, error, refresh } = getUser()

	const authState = computed<AuthState>(() => {
		if (status.value === 'pending') return 'pending'
		if (error.value) return 'error'
		return user.value ? 'authenticated' : 'guest'
	})

	const getResolvedUser = async () => {
		const response = await refresh()
		return response.data ?? null
	}

	return {
		authState,
		getResolvedUser,
		error,
		refresh,
		status,
	}
}
