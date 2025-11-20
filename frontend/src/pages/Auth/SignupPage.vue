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
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const submitSignup = async (email: string, password: string) => {
  const success = await authStore.signup(email, password);
  if (success) {
    router.push('/login');
  }
};
</script>

<style scoped></style>
