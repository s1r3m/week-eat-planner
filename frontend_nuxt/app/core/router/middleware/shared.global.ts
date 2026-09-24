import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'

export default defineNuxtRouteMiddleware(() => {
  const { data: user } = useCurrentUser()

  setPageLayout(user.value ? 'app' : 'default')
})
