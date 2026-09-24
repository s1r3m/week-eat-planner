import type { ValidationError } from '@/modules/auth/types'

import { useSignup } from '@/modules/auth/composables/useSignup'
import { useSignupValidation } from '@/modules/auth/schemas/signup'

export const useSignupForm = () => {
  const { email, errors, handleSubmit, meta, password, username } =
    useSignupValidation()
  const { isLoading, mutate: signup } = useSignup()

  const serverError = ref<null | string>(null)

  const register = handleSubmit(async (values) => {
    serverError.value = null

    try {
      await signup({
        email: values.email,
        password: values.password,
        username: values.username,
      })
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        error.data
      ) {
        const body = error.data as ValidationError
        serverError.value = body.msg
      } else {
        serverError.value = 'Something went wrong'
      }

      throw error
    }
  })

  return {
    email,
    errors,
    isLoading,
    meta,
    password,
    register,
    serverError,
    username,
  }
}
