<template>
  <AuthCard title="Welcome back" description="Login to your account">
    <AuthForm variant="login" :submitting="isSubmitting" @submit="submitLogin" />

    <template #footer>
      <AuthFooter variant="login" />
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/auth';
import { AuthCard, AuthFooter, AuthForm } from '@/features/auth/components';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const isSubmitting = ref(false);

const submitLogin = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const success = await authStore.login(email.value, password.value);
    if (!success) return;
    const redirectParam = route.query.redirect;
    const redirectPath = typeof redirectParam === 'string' ? redirectParam : '/weeks';
    await router.push(redirectPath);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
