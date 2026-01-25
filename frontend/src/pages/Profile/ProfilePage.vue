<template>
  <template v-if="loading">
    <TheLoadingPageState loading-name="the profile" />
  </template>

  <template v-else>
    <PageTitle header="User settings" />
    <Card v-if="userInfo" class="mt-4 mx-4">
      <CardHeader class="text-lg font-semibold"> Profile Information </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field orientation="vertical">
              <FieldLabel for="email">Email</FieldLabel>
              <Input id="email" v-model="userInfo.email" />
            </Field>
            <Field orientation="vertical">
              <FieldLabel for="old_pwd">Old password</FieldLabel>
              <Input id="old_pwd" type="password" />
            </Field>
            <Field orientation="vertical">
              <FieldLabel for="new_pwd">New password</FieldLabel>
              <Input id="new_pwd" type="password" />
            </Field>
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox id="active" v-model="userInfo.is_active" disabled />
              <Label for="active">Active user</Label>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { apiClient } from '@/api/client';

import TheLoadingPageState from '@/components/app/TheLoadingPageState.vue';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import PageTitle from '@/components/shared/PageTitle.vue';

import type { UserInfo } from '@/api/types';
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';

const userInfo = ref<UserInfo>();
const loading = ref(false);

const fetchUser = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/user');
    if (res.status === 200) {
      userInfo.value = res.data as UserInfo;
    }
  } finally {
    loading.value = false;
  }
};
fetchUser();
</script>

<style scoped></style>
