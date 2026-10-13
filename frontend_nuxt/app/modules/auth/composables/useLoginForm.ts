import type { LoginForm } from '@/modules/auth/schemas/login'
import type { LoginPayload } from '@/modules/auth/types'

import { loginMutation } from '@/modules/auth/api/authApi'
import { useLoginValidation } from '@/modules/auth/schemas/login'
import { getFormErrorMessage } from '@/modules/auth/utils/formError'

export const useLoginForm = () => {
  const { email, errors, handleSubmit, meta, password } = useLoginValidation()
  const { isLoading, mutateAsync: loginRequest } = loginMutation()

  const serverError = ref<null | string>(null)

  const login = async (form: LoginForm) => {
    serverError.value = null

    try {
      await loginRequest({
        password: form.password,
        username: form.email,
      } satisfies LoginPayload)
    } catch (error) {
      password.value = ''

      serverError.value = getFormErrorMessage(error)
      throw error
    }
  }

  return {
    email,
    errors,
    handleSubmit,
    isLoading,
    login,
    meta,
    password,
    serverError,
  }
}
