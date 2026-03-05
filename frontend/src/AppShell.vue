<template>
  <div class="app-shell">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/features/auth';

const authStore = useAuthStore();

try {
  await authStore.init();
} catch (err: unknown) {
  // Skip the init then.
  console.error(err);
}
</script>
