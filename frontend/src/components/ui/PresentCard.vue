<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
@import '@/assets/theme.css';
@import 'tailwindcss';

.card {
  @apply flex overflow-hidden rounded-2xl shadow-xl aspect-4/3
  transition-shadow duration-300 hover:shadow-brand-primary;
}
</style>
