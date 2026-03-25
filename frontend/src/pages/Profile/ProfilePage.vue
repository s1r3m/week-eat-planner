<template>
  <div class="profile-page-container">
    <PageTitle header="User settings" description="Update your info" />
    <Card v-if="authStore.user" class="mt-9 mx-6">
      <CardHeader class="text-lg font-semibold"> Profile Information </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel for="email">Email</FieldLabel>
              <Input id="email" v-model="authStore.user.email" />
            </Field>
            <Field>
              <FieldLabel for="username">Username</FieldLabel>
              <Input id="username" v-model="authStore.user.username" />
            </Field>
            <Field>
              <FieldLabel for="old_pwd">Old password</FieldLabel>
              <Input id="old_pwd" type="password" />
            </Field>
            <Field>
              <FieldLabel for="new_pwd">New password</FieldLabel>
              <Input id="new_pwd" type="password" />
            </Field>
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox id="active" v-model="authStore.user.is_active" disabled />
              <Label for="active">Active user</Label>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import PageTitle from '@/components/shared/PageTitle.vue';

import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import { useAuthStore } from '@/features/auth';

const authStore = useAuthStore();
</script>
