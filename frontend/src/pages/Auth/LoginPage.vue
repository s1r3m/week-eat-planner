<template>
  <template v-if="!authStore.user">
    <AuthCard title="Welcome back" description="Login to your account">
      <AuthForm variant="login" :submitting="isLoading" @submit="handleLogin" />

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

import AuthCard from '@/features/auth/components/AuthCard.vue';
import AuthFooter from '@/features/auth/components/AuthFooter.vue';
import AuthForm from '@/features/auth/components/AuthForm.vue';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const { call: login, isLoading, error } = useAsyncCall(authStore.login);

const handleLogin = async (email: string, password: string) => {
  await login(email, password);
  if (!error.value) {
    await router.push((route.query.redirect as string) || '/weeks');
  }
};
</script>
