<template>
  <div id="profile-form-container">
    <form v-if="user" id="profile-form" @submit.prevent="onSubmit">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel for="email">Email</FieldLabel>
            <Input id="email" v-model="user.email" type="email" disabled />
          </Field>
          <Field>
            <FieldLabel for="username">Username</FieldLabel>
            <Input
              id="username"
              v-model="username"
              :class="{ 'border-destructive': errors.username }"
              :disabled="isLoading"
            />
            <FieldError>{{ errors.username }}</FieldError>
          </Field>
        </FieldGroup>
        <Button variant="outline" :disabled="!meta.valid" @click.prevent="onSubmit">
          Save changes
        </Button>
      </FieldSet>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';

import { updateUserMutation } from '@/api/user';
import type { UserData, UserPayload } from '@/api/user';

import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { useMutation } from '@pinia/colada';
import Button from '@/components/ui/button/Button.vue';

const user = defineModel<UserData>();

const schema = zod
  .object({
    username: zod.string().min(1, { error: 'Must be filled' }),
  })
  .refine((data) => data.username !== user.value?.username);
type FormValues = zod.infer<typeof schema>;
const { handleSubmit, errors, meta } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    username: user.value?.username,
  },
});

const { value: username } = useField<FormValues['username']>('username');
const { mutate: update, isLoading } = useMutation(updateUserMutation());
const onSubmit = handleSubmit((values: FormValues) => update({ username: values['username'] }));
</script>
