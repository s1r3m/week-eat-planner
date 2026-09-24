import { AUTH_KEY } from '@/modules/auth//constants'
import { useAuthApi } from '@/modules/auth/api/authApi'

export const useLogin = () => {
  const authApi = useAuthApi()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: authApi.login,
    onSuccess: async () => {
      await queryCache.invalidateQueries({ key: AUTH_KEY.user() })
    },
  })
}
