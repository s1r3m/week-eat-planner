import type { LoginForm } from '@/modules/auth/schemas/login'
import type { LoginPayload } from '@/modules/auth/types'

import { useLogin } from '@/modules/auth/composables/useLogin'
import { useLoginValidation } from '@/modules/auth/schemas/login'

export const useLoginForm = () => {
  const { email, errors, handleSubmit, meta, password } = useLoginValidation()
  const { isLoading, mutateAsync: loginRequest } = useLogin()

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

      if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        error.data
      ) {
        const body = error.data as { detail?: unknown }
        serverError.value =
          typeof body.detail === 'string' && body.detail
            ? body.detail
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
    handleSubmit,
    isLoading,
    login,
    meta,
    password,
    serverError,
  }
}
