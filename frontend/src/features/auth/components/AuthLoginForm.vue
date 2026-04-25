<template>
  <form id="login-form" novalidate @submit.prevent="onSubmit">
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel for="email"> Email </FieldLabel>
          <Input
            id="email"
            v-model="email"
            :class="{ 'border-destructive': errors.email || error }"
            type="email"
            placeholder="your@email.com"
          />
          <FieldError> {{ errors.email }}</FieldError>
        </Field>
        <Field>
          <FieldLabel for="password"> Password </FieldLabel>
          <Input
            id="password"
            v-model="password"
            :class="{ 'border-destructive': errors.password || error }"
            type="password"
            placeholder="Your password"
          />
          <FieldError> {{ errors.password }}</FieldError>
        </Field>
      </FieldGroup>

      <FieldError v-if="error">{{ error.message }}</FieldError>

      <Button type="submit" class="w-full cursor-pointer" :disabled="!meta.valid || isLoading">
        <Spinner v-if="isLoading" />
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </Button>
    </FieldSet>
  </form>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

import { useMutation } from '@pinia/colada';
import { loginMutation } from '@/api/auth';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const schema = zod.object({
  email: zod
    .string()
    .min(1, { error: 'This is required' })
    .pipe(zod.email({ error: 'Invalid email' })),
  password: zod
    .string()
    .min(1, { error: 'This is required' })
    .min(8, { error: 'At least 8 symbols' }),
});
type FormValues = zod.infer<typeof schema>;

const { handleSubmit, errors, meta } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    email: '',
    password: '',
  },
});

const { value: email } = useField<FormValues['email']>('email');
const { value: password } = useField<FormValues['password']>('password');

const { mutate: login, isLoading, error } = useMutation(loginMutation());

const onSubmit = handleSubmit((values: FormValues) => login(values));
</script>
