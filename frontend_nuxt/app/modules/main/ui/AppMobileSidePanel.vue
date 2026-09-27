<script setup lang="ts">
  import BaseSidePanel from '@/common/ui/BaseSidePanel.vue'
  import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
  import AppLogo from '@/modules/main/ui/AppLogo.vue'
  import AppNavigation from '@/modules/main/ui/AppNavigation.vue'
  import AppUser from '@/modules/main/ui/AppUser.vue'

  const { close, isOpen } = useMobileSidebar()

  const onNavigate = () => {
    close()
  }
</script>

<template>
  <BaseSidePanel v-model="isOpen">
    <template #title>
      <AppLogo aria-label="Navigation" />
    </template>

    <div class="app-sidebar">
      <span class="app-sidebar__navigation-title">Navigation</span>

      <AppNavigation @navigate="onNavigate" />

      <AppUser />
    </div>
  </BaseSidePanel>
</template>

<style scoped>
  .app-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: 0 var(--space-2);
  }

  .app-sidebar__navigation-title {
    padding: var(--space-2);
  }
</style>
