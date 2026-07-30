import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

export const useLoginValidation = () => {
	const schema = zod.object({
		email: zod
			.string()
			.trim()
			.min(1, { message: 'This is required' })
			.email({ message: 'Invalid email' }),
		password: zod
			.string()
			.min(1, { message: 'This is required' })
			.min(8, { message: 'At least 8 symbols' }),
	})
	type FormValues = zod.infer<typeof schema>

	const { errors, handleSubmit, meta } = useForm({
		initialValues: {
			email: '',
			password: '',
		},
		validationSchema: toTypedSchema(schema),
	})

	const { value: username } = useField<FormValues['email']>('email')
	const { value: password } = useField<FormValues['password']>('password')

	return { errors, handleSubmit, meta, password, username }
}
