<script setup lang="ts">
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
</script>

<template>
  <Suspense>
    <template #default>
      <slot />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<style scoped></style>
