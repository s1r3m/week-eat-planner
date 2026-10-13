import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import * as z from 'zod'

export const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'This is required' })
    .email({ message: 'Invalid email' }),
  password: z
    .string()
    .min(1, { message: 'This is required' })
    .min(8, { message: 'At least 8 symbols' }),
})

export type LoginForm = z.infer<typeof schema>

export const useLoginValidation = () => {
  const { errors, handleSubmit, meta } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: toTypedSchema(schema),
  })

  const { value: email } = useField<LoginForm['email']>('email')
  const { value: password } = useField<LoginForm['password']>('password')

  return { email, errors, handleSubmit, meta, password }
}
