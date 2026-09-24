<script setup lang="ts">
  defineProps<{
    name: string
  }>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__card">
      <h2 class="empty-state__title">No {{ name }} yet</h2>

      <p class="empty-state__description">Try to create one.</p>
    </div>
  </div>
</template>

<style scoped>
  .empty-state {
    max-width: 30rem;
    margin: var(--space-2) auto;
  }

  .empty-state__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-2);
    border: 1px solid var(--brand-primary);
    border-radius: var(--radius-md);
    background-color: var(--bg-elevated);
  }

  .empty-state__title {
    font-size: var(--text-24);
  }

  .empty-state__description {
    color: var(--brand-primary);
  }
</style>
