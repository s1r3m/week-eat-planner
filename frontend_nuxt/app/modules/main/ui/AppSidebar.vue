<script setup lang="ts">
  import { useSidebar } from '@/common/composables/useSidebar'
  import AppLogo from '@/modules/main/ui/AppLogo.vue'
  import AppNavigation from '@/modules/main/ui/AppNavigation.vue'
  import AppUser from '@/modules/main/ui/AppUser.vue'

  const { collapsed } = useSidebar()
</script>

<template>
  <div class="app-sidebar">
    <AppLogo :collapsed="collapsed" />

    <AppNavigation
      class="app-sidebar__nav"
      :collapsed="collapsed"
    />

    <AppUser :collapsed="collapsed" />
  </div>
</template>

<style scoped>
  .app-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    border-right: 1px solid var(--color-outline);
  }

  .app-sidebar__nav {
    flex: 1;
  }
</style>
