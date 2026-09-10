import { useAuthStore } from '@/modules/auth/stores/auth'
import { getRedirectTarget, isPublicRoute } from '@/modules/auth/utils/session'

export const useSessionInvalidHandler = () => {
  const authStore = useAuthStore()
  const router = useRouter()
  let pending: Promise<void> | null = null

  const handleSessionInvalid = () => {
    if (pending) return pending
    pending = (async () => {
      authStore.clearSession()
      const { path, fullPath } = router.currentRoute.value
      if (isPublicRoute(path)) {
        setPageLayout('default')
        return
      }
      await navigateTo({
        path: '/login',
        query: { redirect: getRedirectTarget(fullPath) },
      })
    })().finally(() => {
      pending = null
    })
    return pending
  }
  return { handleSessionInvalid }
}
