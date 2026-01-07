<template>
  <div class="flex min-h-screen max-w-7xl mx-auto flex-col bg-background text-foreground">
    <GuestHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <GuestFooter />
  </div>
</template>

<script setup lang="ts">
import GuestHeader from '@/components/app/GuestHeader.vue';
import GuestFooter from '@/components/app/GuestFooter.vue';
</script>

<style scoped></style>
