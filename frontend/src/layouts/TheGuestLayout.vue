<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <TheHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/layouts/TheHeader.vue';
import TheFooter from '@/layouts/TheFooter.vue';
</script>

<style scoped></style>
