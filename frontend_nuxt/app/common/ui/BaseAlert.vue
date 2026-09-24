<script setup lang="ts">
  import type { AlertVariant } from '@/common/types'

  defineProps<{
    message: string
    variant: AlertVariant
  }>()

  defineEmits<{
    close: []
  }>()

  const icons = {
    error: 'megaphone',
    success: 'check',
  }

  const titles = {
    error: 'Oops',
    success: 'Great',
  }
</script>

<template>
  <div
    :class="['alert', `alert--${variant}`]"
    :role="variant === 'error' ? 'alert' : 'status'"
  >
    <div class="alert-header">
      <Icon :name="`lucide:${icons[variant]}`" />

      <h2 class="text-title-md">{{ titles[variant] }}</h2>
    </div>

    <p class="text-body-lg">{{ message }}</p>

    <button
      class="icon"
      type="button"
      aria-label="Close alert"
      @click.prevent="$emit('close')"
    >
      <Icon name="lucide:x" />
    </button>
  </div>
</template>

<style scoped>
  .alert {
    display: flex;
    position: relative;
    flex-direction: column;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    gap: var(--space-2);
  }

  .alert-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .alert--error {
    background-color: var(--error);
    color: var(--text-highlighted-2);
  }

  .alert--success {
    background-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
    color: var(--text);
  }

  .icon {
    position: absolute;
    top: 10%;
    border: 0;
    background: transparent;
    color: inherit;
    inset-inline-end: var(--space-4);
  }
</style>
