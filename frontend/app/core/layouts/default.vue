<script setup lang="ts">
  import GuestFooter from '@/modules/main/ui/GuestFooter.vue'
  import GuestHeader from '@/modules/main/ui/GuestHeader.vue'
</script>

<template>
  <div class="layout-container">
    <GuestHeader />

    <main class="guest-main">
      <slot></slot>
    </main>

    <GuestFooter />
  </div>
</template>

<style scoped>
  .layout-container {
    display: flex;
    flex-direction: column;
    max-width: var(--container-max-width);
    min-height: 100dvh;
    margin: 0 auto;
  }

  .guest-main {
    flex: 1 1 auto;
  }
</style>
