import type { LoginPayload } from '@/api/auth'
import type { UserData } from '@/api/user'

import { useAuthApi } from '@/api/auth'
import { useUserApi } from '@/api/user'

export const useAuthStore = defineStore('auth', () => {
	const authApi = useAuthApi()
	const userApi = useUserApi()
	const user = ref<null | UserData>(null)
	const isAuthenticated = computed(() => !!user.value)

	const login = async (payload: LoginPayload) => {
		await authApi.login(payload)
		user.value = await userApi.getUser()
	}

	const logout = async () => {
		await authApi.logout()
		user.value = null
	}

	return { isAuthenticated, login, logout, user }
})
