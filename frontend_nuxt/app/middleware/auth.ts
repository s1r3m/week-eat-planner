export default defineNuxtRouteMiddleware(async (to, _from) => {
	const authStore = useAuthStore()

	await authStore.init()

	if (!authStore.isAuthenticated) {
		return navigateTo({
			name: 'login',
			query: { redirect: to.fullPath },
		})
	}
})
