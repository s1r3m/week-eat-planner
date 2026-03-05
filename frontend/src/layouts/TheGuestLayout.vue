<template>
  <div class="flex min-h-screen max-w-7xl mx-auto flex-col bg-background text-foreground">
    <GuestAppHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <GuestFooter />
  </div>
</template>

<script setup lang="ts">
import GuestAppHeader from '@/components/header/guest/GuestAppHeader.vue';
import GuestFooter from '@/layouts/components/GuestFooter.vue';
</script>
