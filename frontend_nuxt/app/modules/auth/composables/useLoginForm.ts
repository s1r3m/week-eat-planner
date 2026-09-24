import type { LoginPayload, ValidationError } from '@/modules/auth/types'
import type { LoginForm } from '@/modules/auth/schemas/login'

import { useLoginValidation } from '@/modules/auth/schemas/login'
import { useLogin } from '@/modules/auth/composables/useLogin'

export const useLoginForm = () => {
  const { email, errors, meta, password } = useLoginValidation()
  const { mutateAsync: loginRequest, isLoading } = useLogin()

  const serverError = ref<null | string>(null)

  const login = async (form: LoginForm) => {
    serverError.value = null

    try {
      await loginRequest({
        username: form.email,
        password: form.password,
      } satisfies LoginPayload)
    } catch (error) {
      password.value = ''

      if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        error.data
      ) {
        const body = error.data as ValidationError
        serverError.value =
          typeof body.msg === 'string' && body.msg
            ? body.msg
            : 'Something went wrong'
      } else {
        serverError.value = 'Something went wrong'
      }
      throw error
    }
  }

  return {
    email,
    errors,
    isLoading,
    meta,
    password,
    serverError,
    login,
  }
}
