import { useAuthApi } from '@/modules/auth/api/authApi'

export const useSignup = () => {
  const authApi = useAuthApi()

  return useMutation({
    mutation: authApi.create,
  })
}
