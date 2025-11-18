<template>
  <section class="container-center flex justify-center px-4 py-16">
    <div class="auth-card">
      <div class="space-y-2 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.25em] text-brand-primary">Join us</p>
        <h2 class="text-3xl font-semibold text-base-color">Create your account</h2>
      </div>
      <TheError />
      <form
        v-if="!authStore.isAuthenticated"
        class="flex flex-col gap-4"
        @submit.prevent="submitSignup"
      >
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-medium text-muted">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@email.com"
            autocomplete="email"
            required
            class="w-full px-4 py-3 rounded-2xl border border-brand-muted bg-surface-base text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent caret-brand-primary text-base-color"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-sm font-medium text-muted">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Minimum 6 characters"
            autocomplete="new-password"
            minlength="6"
            required
            class="w-full px-4 py-3 rounded-2xl border border-brand-muted bg-surface-base text-base-color placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent caret-brand-primary"
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create account
        </button>
        <p class="text-sm text-center text-muted">
          Already have an account?
          <RouterLink to="/login" class="text-brand-primary font-semibold hover:underline">
            Log in
          </RouterLink>
        </p>
      </form>
      <div v-else class="space-y-2 text-center text-base text-base-color">
        <p>You are already logged in.</p>
        <p class="text-sm text-muted">You can continue planning your meals from the dashboard.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TheError from '@/components/common/ErrorNotification.vue';

import apiClient from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useAlertStore } from '@/stores/error';

const email = ref('');
const password = ref('');

const authStore = useAuthStore();
const errorStore = useAlertStore();
const router = useRouter();

const submitSignup = async () => {
  try {
    const res = await apiClient.post('/auth/signup', {
      email: email.value,
      password: password.value,
    });
    if (res.status == 201) router.push('/login');
  } catch (err: any) {
    errorStore.addError(err.message);
  }
};
</script>

<style scoped></style>
