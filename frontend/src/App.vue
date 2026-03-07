<template>
  <Suspense timeout="0">
    <template #fallback>
      <TheLoadingPageState loading-name="the application" />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import AppShell from '@/AppShell.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
</script>
