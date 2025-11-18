<template>
  <div class="min-h-screen flex flex-col bg-surface-base">
    <TheHeader />
    <div class="flex-1 flex flex-col">
      <router-view />
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/layouts/TheHeader.vue';
import TheFooter from '@/layouts/TheFooter.vue';
</script>

<style scoped></style>
