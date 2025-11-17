<template>
  <Suspense>
    <template #default>
      <slot />
    </template>
    <template #fallback>
      <LoadingSpinner :loading-name="routeName" />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const route = useRoute();
const routeName = route.name?.toString() || 'page';
</script>

<style scoped></style>
