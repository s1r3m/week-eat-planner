<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 id="page-title" class="text-headline-md font-semibold tracking-tight text-primary">
        <Spinner v-if="!header" />
        {{ header ? header : 'Loading...' }}
      </h1>
      <p v-if="description" id="page-description" class="text-body-md text-on-surface-variant mt-1">
        {{ description }}
      </p>
    </div>
    <div class="flex gap-3 justify-end-safe items-center">
      <slot name="controls" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Spinner from '../ui/spinner/Spinner.vue';

defineProps<{
  header?: string;
  description?: string;
}>();
</script>
