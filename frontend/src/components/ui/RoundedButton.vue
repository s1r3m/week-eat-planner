<template>
  <button class="base" :class="styles[variant]" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
const variants = ['default', 'primary', 'danger'] as const;
type Variant = (typeof variants)[number];
withDefaults(
  defineProps<{
    variant?: Variant;
  }>(),
  { variant: 'default' },
);

const styles = {
  default: 'default',
  primary: 'primary',
  danger: 'danger',
};

defineEmits<{
  click: [];
}>();
</script>

<style scoped>
@import '../../theme.css';
@import 'tailwindcss';

.base {
  @apply px-8 py-4 rounded-2xl border shadow-sm cursor-pointer 
  focus-visible:outline-offset-2 transition font-semibold
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none;
}

.default {
  @apply bg-surface-raised text-base-color border-brand-muted/70
  hover:bg-surface-base/80 hover:border-brand-primary
  focus-visible:outline-brand-primary
  active:translate-y-0.5;
}

.primary {
  @apply bg-brand-primary/70 text-white border-transparent
  shadow-brand-primary/35 hover:bg-brand-primary;
}

.danger {
  @apply bg-danger/70  shadow-danger/35 hover:bg-danger border-transparent
  hover:border-danger focus-visible:outline-danger;
}
</style>
