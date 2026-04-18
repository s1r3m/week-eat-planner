<template>
  <div class="signup-page-container">
    <AuthCard v-if="!isAuthenticated" title="Join us" description="Create your account">
      <template #default>
        <AuthSignUpForm />
      </template>

      <template #footer>
        <AuthFooter>
          <CardDescription>
            Already have an account?
            <router-link
              :to="{ name: ROUTE_NAMES.LOGIN }"
              class="font-semibold text-brand-primary hover:underline"
            >
              Log in!
            </router-link>
          </CardDescription>
        </AuthFooter>
      </template>
    </AuthCard>

    <div v-else class="space-y-4 mt-4 text-center text-base text-base-color">
      <p>You are already logged in.</p>
      <p class="text-sm text-muted-foreground">You can continue planning your meals!</p>
      <Button>
        <router-link :to="{ name: ROUTE_NAMES.WEEKS }">Go to planning</router-link>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isAuthenticated } from '@/api/auth';

import AuthFooter from '@/features/auth/components/AuthFooter.vue';

import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import AuthCard from '@/features/auth/components/AuthCard.vue';
import AuthSignUpForm from '@/features/auth/components/AuthSignUpForm.vue';
</script>
