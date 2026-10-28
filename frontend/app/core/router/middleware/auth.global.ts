import type { UserData } from '@/modules/auth/types'

import { useAuth } from '@/modules/auth/composables/useAuth'
import { getRedirectTarget } from '@/modules/auth/utils/session'

export default defineNuxtRouteMiddleware(async (to) => {
	const access = to.meta.auth ?? 'public'
	const redirectAuthenticated = to.meta.redirectAuthenticated ?? false

	if (access === 'public' && !redirectAuthenticated) return

	const { getResolvedUser } = useAuth()
	let user: UserData | null

	try {
		user = await getResolvedUser()
	} catch (error) {
		if (access === 'required') {
			throw createError({
				status: 503,
				statusText: 'Unable to verify your session. Relogin please.',
			})
		}
		return
	}

	if (access === 'required' && !user) {
		return await navigateTo({
			name: 'login',
			query: { redirect: getRedirectTarget(to.fullPath) },
		})
	}

	if ((access === 'guest' || redirectAuthenticated) && user) {
		return await navigateTo({ name: 'my-weeks' })
	}
})
