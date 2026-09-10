import { useAuthStore } from '@/modules/auth/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  setPageLayout(useAuthStore().isAuthenticated ? 'app' : 'default')
})
