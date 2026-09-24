import { getRedirectTarget, isPublicRoute } from '@/modules/auth/utils/session'
import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'

export default defineNuxtRouteMiddleware(async (to) => {
  if (isPublicRoute(to.path)) return

  const { data: user, refresh } = useCurrentUser()

  try {
    await refresh()
  } catch {
    return abortNavigation({
      status: 503,
      message: 'Unable to check your session. Please try again.',
      fatal: true,
    })
  }

  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: getRedirectTarget(to.fullPath) },
    })
  }
})
