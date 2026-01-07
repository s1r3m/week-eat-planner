<template>
  <div class="px-8 pt-8">
    <h1 class="text-2xl font-semibold tracking-tight">{{ header }}</h1>
    <p v-if="description" class="text-muted-foreground mt-xs">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  header: string;
  description?: string;
}>();
</script>
