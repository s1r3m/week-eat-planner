<template>
  <template v-if="!authStore.isAuthenticated">
    <AuthCard title="Welcome back" description="Login to your account">
      <AuthForm variant="login" :submitting="authStore.isLoading" @submit="handleLogin" />

      <template #footer>
        <AuthFooter>
          <CardDescription>
            Forgot your password?
            <router-link
              to="/forgot-password"
              class="font-semibold text-brand-primary hover:underline"
            >
              Reset it
            </router-link>
          </CardDescription>
          <CardDescription>
            Don't have an account?
            <router-link to="/signup" class="font-semibold text-brand-primary hover:underline">
              Register!
            </router-link>
          </CardDescription>
        </AuthFooter>
      </template>
    </AuthCard>
  </template>

  <template v-else>
    <div class="space-y-6 mt-6 text-center text-base text-base-color">
      <p>You are already logged in.</p>
      <p class="text-sm text-muted">You can continue planning your meals!</p>
      <Button>
        <router-link to="/weeks">Go to planning</router-link>
      </Button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/auth';

import { AuthCard, AuthFooter, AuthForm } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

async function handleLogin(email: string, password: string) {
  const success = await authStore.login(email, password);
  if (success) {
    await router.push((route.query.redirect as string) || '/weeks');
  }
}
</script>
