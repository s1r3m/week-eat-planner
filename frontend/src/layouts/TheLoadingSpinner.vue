<template>
  <div class="flex h-full w-full items-center justify-center bg-base-color/20">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"
      ></div>
      <p class="text-gray-600">Loading {{ loadingName }}...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouteRecordNameGeneric } from 'vue-router';

interface Props {
  loadingName?: RouteRecordNameGeneric;
}
withDefaults(defineProps<Props>(), { loadingName: 'data' });
</script>

<style scoped></style>
