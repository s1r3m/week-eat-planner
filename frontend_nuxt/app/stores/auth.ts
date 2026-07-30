import type { LoginPayload, SignupPayload } from '@/api/auth'
import type { UserData } from '@/api/user'

import { useAuthApi } from '@/api/auth'
import { useUserApi } from '@/api/user'

export const useAuthStore = defineStore('auth', () => {
	const authApi = useAuthApi()
	const userApi = useUserApi()
	const user = ref<null | UserData>(null)
	const isAuthenticated = computed(() => !!user.value)

	const signup = async (payload: SignupPayload) => {
		await authApi.signup(payload)
		user.value = await userApi.getUser()
	}

	const login = async (payload: LoginPayload) => {
		await authApi.login(payload)
		user.value = await userApi.getUser()
	}

	const logout = async () => {
		try {
			await authApi.logout()
		} finally {
			// Regardless of status -- remove the user.
			user.value = null
		}
	}

	const init = async () => {
		if (user.value) return
		try {
			user.value = await userApi.getUser()
		} catch {
			user.value = null
		}
	}

	return { init, isAuthenticated, login, logout, signup, user }
})
