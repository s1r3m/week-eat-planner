import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'

export default defineNuxtRouteMiddleware(async () => {
  const { data: user, refresh } = useCurrentUser()

  try {
    await refresh(true)
  } catch {
    return abortNavigation({
      fatal: true,
      message: 'Unable to check your session. Please try again.',
      status: 503,
    })
  }
  setPageLayout(user.value ? 'app' : 'default')
})
