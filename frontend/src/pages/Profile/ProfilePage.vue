<template>
  <div class="profile-page-container space-y-6 m-6">
    <PageTitle header="User settings" description="Update your info" />
    <ErrorRetryCard v-if="error" :error="error" :retry="refetch" />

    <Card v-else-if="user">
      <CardHeader class="text-lg font-semibold"> Profile Information </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel for="email">Email</FieldLabel>
              <Input id="email" v-model="user.email" />
            </Field>
            <Field>
              <FieldLabel for="username">Username</FieldLabel>
              <Input id="username" v-model="user.username" />
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
              <Checkbox id="active" v-model="user.is_active" disabled />
              <Label for="active">Active user</Label>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>

    <TheLoadingPageState v-else-if="isLoading" loading-name="user profile" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@pinia/colada';
import { getUserQuery } from '@/api/auth';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import PageTitle from '@/components/shared/PageTitle.vue';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';

const { data, isLoading, error, refetch } = useQuery(getUserQuery());
const user = ref(data);
</script>
