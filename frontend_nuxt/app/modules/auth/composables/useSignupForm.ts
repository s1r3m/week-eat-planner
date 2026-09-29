import type { SignupForm } from '@/modules/auth/schemas/signup'
import type { SignupPayload } from '@/modules/auth/types'

import { useSignup } from '@/modules/auth/composables/useSignup'
import { useSignupValidation } from '@/modules/auth/schemas/signup'
import { getFormErrorMessage } from '@/modules/auth/utils/formError'

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
      serverError.value = getFormErrorMessage(error)
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
