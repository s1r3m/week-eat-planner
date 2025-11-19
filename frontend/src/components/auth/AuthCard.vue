<template>
  <div class="auth-card space-y-2 text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.25em] text-brand-primary">
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
