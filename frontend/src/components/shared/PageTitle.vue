<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 id="page-title" class="text-2xl font-semibold tracking-tight text-primary">
        {{ header }}
      </h1>
      <p v-if="description" id="page-description" class="text-muted-foreground mt-xs">
        {{ description }}
      </p>
    </div>
    <div class="flex gap-3 justify-end-safe">
      <slot name="controls" />
    </div>
  </div>
</template>
s

<script setup lang="ts">
defineProps<{
  header: string;
  description?: string;
}>();
</script>
