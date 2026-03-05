<template>
  <Suspense timeout="0">
    <template #default>
      <Transition name="fade" mode="out-in">
        <AppShell />
      </Transition>
    </template>

    <template #fallback>
      <TheLoadingPageState loading-name="the application" />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import AppShell from '@/AppShell.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
</script>
