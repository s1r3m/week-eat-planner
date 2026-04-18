<template>
  <form id="signup-form" novalidate @submit.prevent="onSubmit">
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel for="email"> Email <span>*</span> </FieldLabel>
          <Input id="email" v-model="email" type="email" placeholder="your@email.com" />
          <span>{{ errors.email }}</span>
        </Field>
        <Field>
          <FieldLabel for="username"> Username </FieldLabel>
          <Input id="username" v-model="username" type="text" placeholder="Your username" />
          <span>{{ errors.username }}</span>
        </Field>
        <Field>
          <FieldLabel for="password"> Password <span>*</span></FieldLabel>
          <Input id="password" v-model="password" type="password" placeholder="Your password" />
          <span>{{ errors.password }}</span>
        </Field>
      </FieldGroup>

      <Button type="submit" class="w-full cursor-pointer" :disabled="disabled">
        <Spinner v-if="isLoading" />
        {{ isLoading ? 'Signing up...' : 'Sign up' }}
      </Button>
      <FieldSeparator> Or </FieldSeparator>
    </FieldSet>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

import { useMutation } from '@pinia/colada';
import { loginMutation, signupMutation } from '@/api/auth';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const schema = zod.object({
  email: zod.email().min(1, { message: 'This is required' }),
  username: zod.string().optional(),
  password: zod.string().min(1, { message: 'This is required' }).min(8, { message: 'Too short' }),
});
type FormValues = zod.infer<typeof schema>;

const router = useRouter();

const { handleSubmit, errors } = useForm({
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

const disabled = computed(() => !email.value?.trim() || password.value?.trim().length < 8);

const { mutateAsync: signup, isLoading, error } = useMutation(signupMutation());
const { mutateAsync: login, error: loginError } = useMutation(loginMutation());

const onSubmit = handleSubmit(async (values: FormValues) => {
  await signup(values);
  if (!error.value) {
    const params = new URLSearchParams({ username: values.email, password: values.password });
    await login(params);
    if (!loginError.value) await router.push({ name: ROUTE_NAMES.WEEKS });
  }
});
</script>

<style scoped>
span {
  color: var(--color-destructive);
}
</style>
