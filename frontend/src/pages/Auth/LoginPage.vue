<template>
  <section class="container-center flex justify-center px-4 py-16">
    <TheError />
    <AuthCard eyebrow="Welcome back" title="Log in to your account">
      <AuthForm buttonLabel="Log in" @submit="submitLogin">
        <template #after>
          <p class="text-sm text-center text-muted">
            Forgot your password?
            <router-link
              to="/reset-password"
              class="text-brand-primary font-semibold hover:underline"
            >
              Reset it
            </router-link>
          </p>
          <p class="text-sm text-center text-muted">
            Don't have an account?
            <router-link to="/signup" class="text-brand-primary font-semibold hover:underline">
              Sign up
            </router-link>
          </p>
        </template>
      </AuthForm>
    </AuthCard>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import TheError from '@/components/common/ErrorNotification.vue';
import AuthCard from '@/components/auth/AuthCard.vue';
import AuthForm from '@/components/auth/AuthForm.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const submitLogin = async (email: string, password: string) => {
  const success = await authStore.login(email, password);
  if (!success) {
    return;
  }
  const redirectParam = route.query.redirect;
  const redirectPath = typeof redirectParam === 'string' ? redirectParam : '/weeks';
  router.push(redirectPath);
};
</script>

<style scoped></style>
