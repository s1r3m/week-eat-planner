<template>
  <div class="px-8 pt-8">
    <h1 id="page-title" class="text-2xl font-semibold tracking-tight">{{ header }}</h1>
    <p v-if="description" id="page-description" class="text-muted-foreground mt-xs">
      {{ description }}
    </p>
  </div>
</template>
s

<script setup lang="ts">
defineProps<{
  header: string;
  description?: string;
}>();
</script>
