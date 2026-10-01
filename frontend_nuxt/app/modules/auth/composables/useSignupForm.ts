import type { SignupForm } from '@/modules/auth/schemas/signup'
import type { SignupPayload } from '@/modules/auth/types'

import { registerMutation } from '@/modules/auth/api/authApi'
import { useSignupValidation } from '@/modules/auth/schemas/signup'
import { getFormErrorMessage } from '@/modules/auth/utils/formError'

export const useSignupForm = () => {
  const { email, errors, handleSubmit, meta, password, username } =
    useSignupValidation()
  const { isLoading, mutateAsync: signup } = registerMutation()

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
