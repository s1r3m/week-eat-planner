<template>
  <template v-if="!authStore.isAuthenticated">
    <AuthCard title="Join us" description="Create your account">
      <AuthForm variant="signup" :submitting="authStore.isLoading" @submit="handleSignup" />

      <template #footer>
        <AuthFooter>
          <CardDescription>
            Already have an account?
            <router-link to="/login" class="font-semibold text-brand-primary hover:underline">
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
        <router-link to="/weeks">Go to planning</router-link>
      </Button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/auth';
import { AuthCard, AuthFooter, AuthForm } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';

const authStore = useAuthStore();
const router = useRouter();

async function handleSignup(email: string, password: string) {
  const success = await authStore.signup(email, password);
  if (success) {
    // TODO: think about logging in immediately.
    await router.push('/login');
  }
}
</script>

<style scoped></style>
