<template>
  <div v-if="user">
    <p v-if="user.oauth_provider" class="mb-3">
      The password is managed by {{ user.oauth_provider }}
    </p>
    <form id="change-password-form" @submit.prevent="onSubmit">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel for="old_pwd">Current password</FieldLabel>
            <Input
              id="old_pwd"
              v-model="current_password"
              type="password"
              :class="{
                'border-destructive': errors.current_password,
                'focus-visible:border-destructive': errors.current_password,
              }"
              :disabled="!!user.oauth_provider"
            />
            <FieldError>{{ errors.current_password }}</FieldError>
          </Field>
          <Field>
            <FieldLabel for="new_pwd">New password</FieldLabel>
            <Input
              id="new_pwd"
              v-model="new_password"
              type="password"
              :class="{
                'border-destructive': errors.new_password,
                'focus-visible:border-destructive': errors.new_password,
              }"
              :disabled="!!user.oauth_provider"
            />
          </Field>
          <FieldError>{{ errors.new_password }}</FieldError>
          <Field>
            <FieldLabel for="confirm_pwd">Confirm password</FieldLabel>
            <Input
              id="confirm_pwd"
              v-model="confirm_password"
              type="password"
              :class="{
                'border-destructive': errors.confirm_password,
                'focus-visible:border-destructive': errors.confirm_password,
              }"
              :disabled="!!user.oauth_provider"
            />
          </Field>
          <FieldError>{{ errors.confirm_password }}</FieldError>
        </FieldGroup>
        <Button variant="outline" :disabled="isLoading || !meta.valid" @click.prevent="onSubmit">
          Change password
        </Button>
      </FieldSet>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

import { changePasswordMutation, type UserData } from '@/api/user';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { useMutation } from '@pinia/colada';
import FieldError from '@/components/ui/field/FieldError.vue';

const user = defineModel<UserData>();

const schema = zod
  .object({
    current_password: zod
      .string()
      .min(1, { error: 'This is required' })
      .min(8, { error: 'At least 8 symbols' }),
    new_password: zod
      .string()
      .min(1, { error: 'This is required' })
      .min(8, { error: 'At least 8 symbols' }),
    confirm_password: zod
      .string()
      .min(1, { error: 'This is required' })
      .min(8, { error: 'At least 8 symbols' }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    error: 'Passwords do not match',
    path: ['confirm_password'],
  });
type FormValues = zod.infer<typeof schema>;
const { handleSubmit, errors, meta, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    current_password: '',
    new_password: '',
    confirm_password: '',
  },
});

const { value: current_password } = useField<FormValues['current_password']>('current_password');
const { value: new_password } = useField<FormValues['new_password']>('new_password');
const { value: confirm_password } = useField<FormValues['confirm_password']>('confirm_password');
const { mutateAsync: changePassword, isLoading } = useMutation(changePasswordMutation());

const onSubmit = handleSubmit(async (values: FormValues) => {
  await changePassword({
    old_password: values.current_password,
    new_password: values.new_password,
  });
  resetForm();
});
</script>
