import { useAuthApi } from '@/modules/auth/composables/authApi'
import { AUTH_KEY } from '@/modules/auth//constants'

export const useLogin = () => {
  const { login } = useAuthApi()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: login,
    onSuccess: async () => {
      await queryCache.invalidateQueries({ key: AUTH_KEY.user() })
    },
  })
}
