import { useAuth } from '@/modules/auth/composables/useAuth'
import { getRedirectTarget, isPublicRoute } from '@/modules/auth/utils/session'

export default defineNuxtRouteMiddleware(async (to) => {
	if (isPublicRoute(to.path)) return

	const { getResolvedUser } = useAuth()

	const user = await getResolvedUser()

	if (!user) {
		return navigateTo({
			path: '/login',
			query: { redirect: getRedirectTarget(to.fullPath) },
		})
	}
})
