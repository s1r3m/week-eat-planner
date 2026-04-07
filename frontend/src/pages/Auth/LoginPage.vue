<template>
  <div class="login-page-container">
    <template v-if="!isAuthenticated">
      <AuthCard title="Welcome back" description="Login to your account">
        <AuthForm variant="login" :submitting="isLoading" @submit="handleLogin" />

        <template #footer>
          <AuthFooter>
            <CardDescription>
              Forgot your password?
              <router-link
                :to="{ name: ROUTE_NAMES.FORGOT_PASSWORD }"
                class="font-semibold text-brand-primary hover:underline"
              >
                Reset it
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
          </AuthFooter>
        </template>
      </AuthCard>
    </template>

    <template v-else>
      <div class="space-y-6 mt-6 text-center text-base text-base-color">
        <p>You are already logged in.</p>
        <p class="text-sm text-muted">You can continue planning your meals!</p>
        <Button as-child>
          <router-link :to="{ name: ROUTE_NAMES.WEEKS }">Go to planning</router-link>
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import AuthCard from '@/features/auth/components/AuthCard.vue';
import AuthFooter from '@/features/auth/components/AuthFooter.vue';
import AuthForm from '@/features/auth/components/AuthForm.vue';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';

import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { isAuthenticated, loginMutation } from '@/api/auth';

const router = useRouter();
const route = useRoute();

const { mutateAsync: login, isLoading, error } = useMutation(loginMutation());

const handleLogin = async (email: string, password: string) => {
  const params = new URLSearchParams({ username: email, password });
  await login(params);
  if (!error.value) {
    await router.push({ name: (route.query.redirect as string) || ROUTE_NAMES.WEEKS });
  }
};
</script>
