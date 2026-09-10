import { useAuthStore } from '@/modules/auth/stores/auth'
import { getRedirectTarget, isPublicRoute } from '@/modules/auth/utils/session'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const isPublic = isPublicRoute(to.path)
  try {
    await authStore.init()
  } catch {
    if (isPublic) return
    return abortNavigation(
      createError({
        statusCode: 503,
        message: 'Unable to check your session. Please try again.',
        fatal: true,
      }),
    )
  }
  if (!isPublic && !authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: getRedirectTarget(to.fullPath) },
    })
  }
})
