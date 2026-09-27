<script setup lang="ts">
  import { useSidebar } from '@/common/composables/useSidebar'
  import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
  import AppHeader from '@/modules/main/ui/AppHeader.vue'
  import AppSidebar from '@/modules/main/ui/AppSidebar.vue'
  import AppMobileSidePanel from '@/modules/main/ui/AppMobileSidePanel.vue'

  const { collapsed } = useSidebar()
  const { isOpen } = useMobileSidebar()
</script>

<template>
  <div
    class="app-layout"
    :class="{ 'app-layout--collapsed': collapsed }"
  >
    <AppHeader class="app-layout__header" />

    <AppSidebar class="app-layout__sidebar" />

    <AppMobileSidePanel class="app-layout__side-panel" />

    <main class="app-layout__content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
  .app-layout {
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

  .app-layout--collapsed {
    --sidebar-width: var(--sidebar-collapsed);
  }

  .app-layout__header {
    grid-area: head;
  }

  .app-layout__sidebar {
    grid-area: side;
  }

  .app-layout__content {
    grid-area: main;
    overflow-y: scroll;
  }

  .app-layout__side-panel {
    display: none;
  }

  @media (--mobile) {
    .app-layout {
      grid-template:
        'head' var(--header-height)
        'main' 1fr
        / 1fr;
    }

    .app-layout__sidebar {
      display: none;
    }

    .app-layout__side-panel {
      display: block;
    }
  }
</style>
