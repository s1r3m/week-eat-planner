import { AUTH_KEY } from '@/modules/auth/constants'
import { useAuthApi } from '@/modules/auth/composables/authApi'
import { isUnauthorized } from '../utils/session'

export const useCurrentUser = () => {
  const { getUser } = useAuthApi()

  return useQuery({
    key: AUTH_KEY.user(),
    query: async () => {
      try {
        return await getUser()
      } catch (error) {
        if (isUnauthorized(error)) return null
        throw error
      }
    },
  })
}
