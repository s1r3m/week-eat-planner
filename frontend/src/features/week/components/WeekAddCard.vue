<template>
  <div @click.stop="$emit('create')">
    <span class="text-9xl font-bold text-primary">+</span>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  create: [];
}>();
</script>
