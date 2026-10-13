import type { AuthState } from '@/modules/auth/types'

import { getUser } from '@/modules/auth/api/authApi'

export const useAuth = () => {
  const { data: user, status, error, refresh } = getUser()

  const authState = computed<AuthState>(() => {
    if (status.value === 'pending') {
      return 'pending'
    }
    return user.value ? 'authenticated' : 'guest'
  })

  const getResolvedUser = async () => {
    await refresh()
    return user.value ?? null
  }

  return {
    authState,
    getResolvedUser,
    error,
    refresh,
    status,
  }
}
