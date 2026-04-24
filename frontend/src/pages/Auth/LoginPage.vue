<template>
  <div id="login-form-container">
    <AuthCard title="Welcome back" description="Login with your account">
      <template #default>
        <AuthLoginForm />
        <FieldSeparator class="my-3"> Or </FieldSeparator>
        <AuthSocialButtons />
      </template>

      <template #footer>
        <CardDescription class="text-sm">
          Forgot your password?
          <router-link
            :to="{ name: ROUTE_NAMES.FORGOT_PASSWORD }"
            class="font-semibold text-brand-primary hover:underline"
          >
            Reset it!
          </router-link>
        </CardDescription>
        <CardDescription>
          Don't have an account?
          <router-link
            :to="{ name: ROUTE_NAMES.SIGNUP }"
            class="font-semibold text-brand-primary hover:underline"
          >
            Register!
          </router-link>
        </CardDescription>
      </template>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '@/domain/router/routeNames';

import AuthCard from '@/features/auth/components/AuthCard.vue';
import AuthLoginForm from '@/features/auth/components/AuthLoginForm.vue';
import AuthSocialButtons from '@/features/auth/components/AuthSocialButtons.vue';
import { CardDescription } from '@/components/ui/card';
import { FieldSeparator } from '@/components/ui/field';
</script>
