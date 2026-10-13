import { useAuth } from '~/modules/auth/composables/useAuth'

export default defineNuxtRouteMiddleware(async () => {
	const { getResolvedUser } = useAuth()
	const user = await getResolvedUser()

	setPageLayout(user ? 'app' : 'default')
})
