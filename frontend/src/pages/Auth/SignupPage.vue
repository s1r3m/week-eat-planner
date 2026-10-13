<template>
  <div id="signup-form-container">
    <AuthCard title="Join us" description="Create your account">
      <template #default>
        <AuthSignUpForm />
        <FieldSeparator class="my-3"> Or </FieldSeparator>
        <AuthSocialButtons />
      </template>

      <template #footer>
        <CardDescription>
          Already have an account?
          <router-link
            :to="{ name: ROUTE_NAMES.LOGIN }"
            class="font-semibold text-brand-primary hover:underline"
          >
            Log in!
          </router-link>
        </CardDescription>
      </template>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '@/domain/router/routeNames';

import AuthCard from '@/features/auth/components/AuthCard.vue';
import AuthSignUpForm from '@/features/auth/components/AuthSignUpForm.vue';
import AuthSocialButtons from '@/features/auth/components/AuthSocialButtons.vue';
import { CardDescription } from '@/components/ui/card';
import { FieldSeparator } from '@/components/ui/field';
</script>
