import { useAuthApi } from '@/modules/auth/api/authApi'
import { AUTH_KEY } from '@/modules/auth/constants'

export const useLogout = () => {
  const authApi = useAuthApi()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: authApi.logout,
    onSettled: () => {
      queryCache.invalidateQueries({ key: AUTH_KEY.user() })
    },
  })
}
