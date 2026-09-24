<script setup lang="ts">
  defineProps<{
    description: string
    header: string
  }>()
</script>

<template>
  <div class="auth-card">
    <h1 class="auth-card__title">{{ header }}</h1>

    <p class="auth-card__description">{{ description }}</p>

    <slot></slot>
  </div>
</template>

<style scoped>
  .auth-card {
    display: flex;
    flex-direction: column;
    max-width: 480px;
    padding: var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--bg-elevated);
    gap: var(--space-4);
  }

  .auth-card__title {
    color: var(--brand-primary);
    font-size: var(--text-20);
    line-height: 1.25;
    text-align: center;
  }

  .auth-card__description {
    color: var(--text-toned);
    text-align: center;
  }
</style>
