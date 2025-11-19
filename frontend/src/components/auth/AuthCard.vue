<template>
  <div class="auth-card space-y-2">
    <p class="text-sm font-semibold uppercase tracking-[0.25em] text-brand-primary text-center">
      {{ eyebrow }}
    </p>
    <h2 class="text-3xl font-semibold text-base-color">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  eyebrow: string;
  title: string;
}
defineProps<Props>();
</script>

<style scoped></style>
