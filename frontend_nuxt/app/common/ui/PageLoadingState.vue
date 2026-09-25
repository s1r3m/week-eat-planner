<script setup lang="ts">
  const { name = '' } = defineProps<{
    name?: string
  }>()
</script>

<template>
  <div class="loading-state">
    <div class="loading-state__card">
      <h2 class="loading-state__title">Loading {{ name }}...</h2>
    </div>
  </div>
</template>

<style scoped>
  .loading-state {
    width: 100%;
    max-width: 30rem;
    margin: var(--space-2) auto;
  }

  .loading-state__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background-color: var(--bg-elevated);
  }

  .loading-state__title {
    font-size: var(--text-24);
  }
</style>
