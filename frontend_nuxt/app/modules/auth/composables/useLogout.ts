import { useAuthApi } from '@/modules/auth/api/authApi'
import { AUTH_KEY } from '@/modules/auth/constants'
import { WEEKS_KEY } from '@/modules/weeks/constants'

export const useLogout = () => {
  const authApi = useAuthApi()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: authApi.logout,
    onSuccess: () => {
      queryCache.setQueryData(AUTH_KEY.user(), null)
      queryCache.invalidateQueries({ key: WEEKS_KEY.all() })
    },
  })
}
