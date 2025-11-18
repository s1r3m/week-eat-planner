<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/client';
import { useClientIdStore } from '@/stores/clientId';
import { useAlertStore } from '@/stores/error';
import TheError from '@/components/common/ErrorNotification.vue';

const email = ref('');
const password = ref('');

const authStore = useAuthStore();
const clientIdStore = useClientIdStore();
const errorStore = useAlertStore();
const route = useRoute();
const router = useRouter();

const submitLogin = async () => {
  const params = new URLSearchParams({
    username: email.value,
    password: password.value,
    client_id: clientIdStore.getClientId(),
  });
  try {
    const res = await apiClient.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    authStore.setToken(res.data);
    const redirectPath = route.query.redirect || '/weeks';
    router.push(redirectPath as string);
  } catch (err: any) {
    errorStore.addError(err.response?.data?.detail || 'Login failed');
  }
};
</script>

<template>
  <div class="container-center flex justify-center px-4 py-16">
    <div
      class="w-full max-w-lg bg-surface-raised border border-brand-muted rounded-3xl shadow-[0_20px_45px_rgba(15,23,42,0.12)] p-10 space-y-6"
    >
      <div class="space-y-2 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.25em] text-brand-primary">
          Welcome back
        </p>
        <h2 class="text-3xl font-semibold text-base-color">Login to your account</h2>
      </div>
      <TheError />
      <form
        v-if="!authStore.isAuthenticated"
        class="flex flex-col gap-4"
        @submit.prevent="submitLogin"
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
          class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create account
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
