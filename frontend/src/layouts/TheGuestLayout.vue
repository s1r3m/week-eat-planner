<template>
  <div class="flex min-h-screen max-w-7xl mx-auto flex-col bg-surface text-on-surface">
    <GuestAppHeader />
    <main class="flex-1">
      <router-view v-slot="{ Component, route }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </router-view>
    </main>
    <GuestFooter />
  </div>
</template>

<script setup lang="ts">
import GuestFooter from '@/layouts/components/GuestFooter.vue';
import GuestAppHeader from './components/header/guest/GuestAppHeader.vue';
</script>
