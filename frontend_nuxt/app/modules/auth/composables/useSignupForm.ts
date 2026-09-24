import type { SignupForm } from '@/modules/auth/schemas/signup'
import type { SignupPayload } from '@/modules/auth/types'

import { useSignup } from '@/modules/auth/composables/useSignup'
import { useSignupValidation } from '@/modules/auth/schemas/signup'

export const useSignupForm = () => {
  const { email, errors, handleSubmit, meta, password, username } =
    useSignupValidation()
  const { isLoading, mutateAsync: signup } = useSignup()

  const serverError = ref<null | string>(null)

  const register = async (form: SignupForm) => {
    serverError.value = null

    try {
      await signup({
        email: form.email,
        password: form.password,
        username: form.username,
      } satisfies SignupPayload)
    } catch (error) {
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
    meta,
    password,
    register,
    serverError,
    username,
  }
}
