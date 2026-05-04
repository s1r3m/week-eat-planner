<template>
  <div id="profle-form-container">
    <form v-if="form" id="profile-form" @submit.prevent="onSubmit">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel for="email">Email</FieldLabel>
            <Input id="email" v-model="form.email" type="email" disabled required />
          </Field>
          <Field>
            <FieldLabel for="username">Username</FieldLabel>
            <Input id="username" v-model="form.username" :disabled="isLoading" required />
          </Field>
        </FieldGroup>
        <FieldSeparator />
        <FieldGroup>
          <Field>
            <FieldLabel for="old_pwd">Current password</FieldLabel>
            <Input id="old_pwd" type="password" disabled />
          </Field>
          <Field>
            <FieldLabel for="new_pwd">New password</FieldLabel>
            <Input id="new_pwd" type="password" disabled />
          </Field>
        </FieldGroup>
        <FieldSeparator />
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox id="active" v-model="form.is_active" disabled />
            <Label for="active">Account is active</Label>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
    <Button @click.prevent="onSubmit"> Save changes </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { updateUserMutation, type UserData } from '@/api/user';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { useMutation } from '@pinia/colada';
import Button from '@/components/ui/button/Button.vue';

const user = defineModel<UserData>();
const form = ref<UserData>();

const { mutate: update, isLoading } = useMutation(updateUserMutation());

const copy = (data: any) => JSON.parse(JSON.stringify(data));
const onSubmit = () => {
  if (form.value) update(form.value);
};

watch(
  user,
  (data) => {
    if (data) {
      form.value = copy(data);
    }
  },
  { immediate: true },
);
</script>
