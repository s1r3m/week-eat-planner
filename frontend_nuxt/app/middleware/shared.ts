export default defineNuxtRouteMiddleware(async (_to, _from) => {
	const authStore = useAuthStore()

	await authStore.init()

	setPageLayout(authStore.isAuthenticated ? 'app' : 'default')
})
