<script setup lang="ts">
  type BadgeVariant = 'default' | 'outline' | 'recipe-name'

  const { variant = 'default' } = defineProps<{
    variant?: BadgeVariant
  }>()
</script>

<template>
  <p :class="['badge', `badge--${variant}`]">
    <slot></slot>
  </p>
</template>

<style scoped>
  .badge {
    display: flex;
    align-items: center;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-lg);
    font-size: var(--text-10);
  }

  .badge--default {
    background-color: var(--brand-primary);
  }

  .badge--outline {
    border: 1px dotted var(--brand-primary);
    background-color: var(--bg);
    color: var(--brand-primary);
    font-size: var(--text-12);
  }

  .badge--recipe-name {
    border: none;
    background-color: var(--bg);
    font-size: var(--text-12);
  }
</style>
