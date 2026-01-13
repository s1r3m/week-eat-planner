<template>
  <template v-if="!authStore.accessToken">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <slot name="before"></slot>

      <div class="flex flex-col gap-1.5">
        <label for="email" class="text-sm font-medium text-muted">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="your@email.com"
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
          :placeholder="variant === 'login' ? 'Your password' : 'Minimum 6 characters'"
          :autocomplete="variant === 'login' ? 'current-password' : 'new-password'"
          minlength="6"
          required
          class="w-full px-4 py-3 rounded-2xl border border-brand-muted bg-surface-base text-base-color placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent caret-brand-primary"
        />
      </div>

      <Button
        type="submit"
        :disabled="!email || password.length < 6"
        class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ variant === 'login' ? 'Log in' : 'Sign up' }}
      </Button>

      <slot name="after"></slot>
    </form>
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
import { ref } from 'vue';
import { useAuthStore } from '@/features/auth/store/auth';
import { Button } from '@/components/ui/button';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');

interface Props {
  variant: 'login' | 'signup';
}
defineProps<Props>();

const emit = defineEmits<{ submit: [string, string] }>();

const handleSubmit = () => {
  emit('submit', email.value, password.value);
};
</script>

<style scoped></style>
