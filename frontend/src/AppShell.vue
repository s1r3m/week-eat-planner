<template>
  <div class="app-shell h-full">
    <router-view v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.meta.requiresAuth ? 'auth' : 'guest'" />
      </Transition>
    </router-view>
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
