<template>
  <section class="container-center flex justify-center px-4 py-16">
    <TheError />
    <AuthCard eyebrow="Join us" title="Create your account">
      <AuthForm buttonLabel="Create account" @submit="submitSignup">
        <template #after>
          <p class="text-sm text-center text-muted">
            Already have an account?
            <router-link to="/login" class="text-brand-primary font-semibold hover:underline">
              Log in
            </router-link>
          </p>
        </template>
      </AuthForm>
    </AuthCard>
  </section>
</template>

<script setup lang="ts">
import TheError from '@/components/common/ErrorNotification.vue';
import AuthCard from '@/components/auth/AuthCard.vue';
import AuthForm from '@/components/auth/AuthForm.vue';
import { useAuthStore } from '@/stores/auth';

const submitSignup = async (email: string, password: string) => {
  const authStore = useAuthStore();
  authStore.signup(email, password);
};
</script>

<style scoped></style>
