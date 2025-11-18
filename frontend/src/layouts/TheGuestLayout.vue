<template>
  <TheHeader />
  <main>
    <router-view />
  </main>
  <TheFooter />
</template>

<script setup lang="ts">
import TheHeader from '@/layouts/TheHeader.vue';
import TheFooter from '@/layouts/TheFooter.vue';
</script>

<style scoped></style>
