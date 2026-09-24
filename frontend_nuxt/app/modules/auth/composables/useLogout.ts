import { useAuthApi } from '@/modules/auth/api/authApi'
import { AUTH_KEY } from '@/modules/auth/constants'

export const useLogout = () => {
  const authApi = useAuthApi()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: authApi.logout,
    onSuccess: () => {
      queryCache.setQueryData(AUTH_KEY.user(), null)
    },
  })
}
