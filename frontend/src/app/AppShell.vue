<template>
  <router-view v-if="isReady" />
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted } from 'vue';
import { useAuthStore } from '@/features/auth/store/auth';

const isReady: Ref<boolean> = ref(false);
const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.init();
  } catch (err: unknown) {
    // Skip the init then.
    console.error(err);
  } finally {
    isReady.value = true;
  }
});
</script>
