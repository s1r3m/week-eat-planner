<template>
  <AuthCard title="Join us" description="Create your account">
    <AuthForm variant="signup" :submitting="isSubmitting" @submit="submitSignup" />

    <template #footer>
      <AuthFooter variant="signup" />
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/auth';
import { AuthCard, AuthFooter, AuthForm } from '@/features/auth/components';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const isSubmitting = ref(false);

const submitSignup = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const success = await authStore.signup(email.value, password.value);
    if (success) {
      await router.push('/login');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped></style>
