<script setup lang="ts">
  import { useSidebar } from '@/common/composables/useSidebar'
  import AppHeader from '@/modules/main/ui/AppHeader.vue'
  import AppSidebar from '@/modules/main/ui/AppSidebar.vue'

  const { collapsed } = useSidebar()
</script>

<template>
  <div
    class="layout"
    :class="{ 'layout--collapsed': collapsed }"
  >
    <AppHeader class="auth-header" />

    <AppSidebar class="auth-sidebar" />

    <main class="content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
  .layout {
    --sidebar-width: var(--sidebar-expanded);

    display: grid;
    grid-template:
      'side head' var(--header-height)
      'side main' 1fr
      / var(--sidebar-width) 1fr;
    width: 100%;
    height: 100vh;
    transition: grid-template-columns var(--duration-base) ease;
  }

  .layout--collapsed {
    --sidebar-width: var(--sidebar-collapsed);
  }

  .auth-header {
    grid-area: head;
  }

  .auth-sidebar {
    grid-area: side;
  }

  .content {
    grid-area: main;
  }
</style>
