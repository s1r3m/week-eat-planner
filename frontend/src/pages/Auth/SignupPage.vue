<template>
  <div class="signup-page-container">
    <template v-if="!authStore.user">
      <AuthCard title="Join us" description="Create your account">
        <AuthForm variant="signup" :submitting="isLoading" @submit="handleSignup" />

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
    </template>

    <template v-else>
      <div class="space-y-4 mt-4 text-center text-base text-base-color">
        <p>You are already logged in.</p>
        <p class="text-sm text-muted">You can continue planning your meals!</p>
        <Button>
          <router-link :to="{ name: ROUTE_NAMES.WEEKS }">Go to planning</router-link>
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/auth';

import AuthCard from '@/features/auth/components/AuthCard.vue';
import AuthFooter from '@/features/auth/components/AuthFooter.vue';
import AuthForm from '@/features/auth/components/AuthForm.vue';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const authStore = useAuthStore();
const router = useRouter();

const { call: signup, isLoading, error } = useAsyncCall(authStore.signup);

const handleSignup = async (email: string, password: string) => {
  await signup(email, password);
  if (!error.value) {
    // TODO: think about logging in immediately.
    await router.push({ name: ROUTE_NAMES.LOGIN });
  }
};
</script>
