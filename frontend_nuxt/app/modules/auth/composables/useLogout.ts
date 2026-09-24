import type { SuccessResponse } from '@/modules/auth/types'

import { AUTH_KEY } from '@/modules/auth/constants'

export const useLogout = () => {
  const { $api } = useNuxtApp()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: () => $api<SuccessResponse>('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      queryCache.invalidateQueries({ key: AUTH_KEY.user() })
    },
  })
}
