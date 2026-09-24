<script setup lang="ts">
  type ButtonType = 'button' | 'submit'
  type ButtonVariant = 'danger' | 'icon' | 'outline' | 'primary'

  const {
    disabled = false,
    type = 'button',
    variant = 'primary',
  } = defineProps<{
    disabled?: boolean
    type?: ButtonType
    variant?: ButtonVariant
  }>()
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`]"
    :disabled="disabled"
    :type="type"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2) var(--space-4);
    gap: var(--space-4);
    transition: background-color var(--duration-fast) ease;
    border: 1px solid transparent;
    border-radius: var(--radius-xl);
    font-size: var(--text-16);
    font-weight: 400;
  }

  .btn--primary {
    border-color: var(--brand-primary);
    background-color: var(--brand-primary);
    color: var(--text);
  }

  .btn--danger {
    border-color: var(--error);
    background-color: var(--bg);
    color: var(--error);
  }

  .btn--outline {
    border-color: var(--brand-primary);
    background-color: var(--bg);
    color: var(--brand-primary);
  }

  .btn--icon {
    margin: 0;
    padding: var(--space-2);
    background: transparent;
    color: var(--brand-primary);
    font-size: var(--text-24);
  }

  .btn--outline:not(:disabled):hover,
  .btn--icon:not(:disabled):hover {
    background-color: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  }

  .btn:disabled {
    @mixin control-disabled;
  }

  .btn:not(:disabled):hover {
    transform: scale(1.02);
  }

  .btn:not(:disabled):active {
    transform: scale(0.98);
  }
</style>
