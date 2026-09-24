<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'

  defineProps<{
    error: Error
    name: string
  }>()

  defineEmits<{
    retry: []
  }>()
</script>

<template>
  <div class="error-state">
    <div class="error-state__card">
      <h2 class="error-state__title">Failed to load {{ name }}</h2>

      <p class="error-state__description">{{ error.message }}</p>

      <BaseButton @click="$emit('retry')">Try again</BaseButton>
    </div>
  </div>
</template>

<style scoped>
  .error-state {
    max-width: 30rem;
    margin: var(--space-4) auto;
  }

  .error-state__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background-color: var(--bg-elevated);
  }

  .error-state__title {
    color: var(--error);
    font-size: var(--text-24);
  }

  .error-state__description {
    font-size: var(--text-14);
  }
</style>
