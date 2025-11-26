<template>
  <div class="stack-container" @click.stop="$emit('create-week')">
    <img src="@/assets/add_week_bg_1.png" alt="Week Image" />
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'create-week': [];
}>();
</script>

<style scoped>
@import 'tailwindcss';

.stack-container {
  @apply grid;
}
</style>
