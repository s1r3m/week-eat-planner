<template>
  <form id="signup-form" novalidate @submit.prevent="onSubmit">
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel for="email"> Email </FieldLabel>
          <Input id="email" v-model="email" type="email" placeholder="your@email.com" />
          <FieldError>{{ errors.email }}</FieldError>
        </Field>
        <Field>
          <FieldLabel for="username"> Username </FieldLabel>
          <Input id="username" v-model="username" type="text" placeholder="Your username" />
          <FieldError>{{ errors.username }}</FieldError>
        </Field>
        <Field>
          <FieldLabel for="password"> Password </FieldLabel>
          <Input id="password" v-model="password" type="password" placeholder="Your password" />
          <FieldError>{{ errors.password }}</FieldError>
        </Field>
      </FieldGroup>

      <FieldError v-if="error">{{ error.message }}</FieldError>

      <Button type="submit" :disabled="!meta.valid || isLoading">
        <Spinner v-if="isLoading" />
        {{ isLoading ? 'Signing up...' : 'Sign up' }}
      </Button>
    </FieldSet>
  </form>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

import { useMutation } from '@pinia/colada';
import { signupMutation } from '@/api/auth';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const schema = zod.object({
  email: zod.email().min(1, { message: 'This is required' }),
  username: zod.string().min(1, { message: 'This is required' }),
  password: zod.string().min(1, { message: 'This is required' }).min(8, { message: 'Too short' }),
});
type FormValues = zod.infer<typeof schema>;

const { handleSubmit, errors, meta } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    email: '',
    username: '',
    password: '',
  },
});

const { value: email } = useField<FormValues['email']>('email');
const { value: username } = useField<FormValues['username']>('username');
const { value: password } = useField<FormValues['password']>('password');

const { mutateAsync: signup, isLoading, error } = useMutation(signupMutation());

const onSubmit = handleSubmit((values: FormValues) => signup(values));
</script>
