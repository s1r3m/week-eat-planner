import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'
import { getRedirectTarget, isPublicRoute } from '@/modules/auth/utils/session'

export default defineNuxtRouteMiddleware(async (to) => {
  if (isPublicRoute(to.path)) return

  const { data: user, refetch } = useCurrentUser()

  try {
    await refetch(true)
  } catch {
    return abortNavigation({
      fatal: true,
      message: 'Unable to check your session. Please try again.',
      status: 503,
    })
  }

  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: getRedirectTarget(to.fullPath) },
    })
  }
})
