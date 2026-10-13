<script setup lang="ts">
  import BaseSidePanel from '@/common/ui/BaseSidePanel.vue'
  import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
  import AppLogo from '@/modules/main/ui/AppLogo.vue'
  import AppNavigation from '@/modules/main/ui/AppNavigation.vue'
  import AppUser from '@/modules/main/ui/AppUser.vue'

  const { close, isOpen } = useMobileSidebar()
</script>

<template>
  <BaseSidePanel v-model="isOpen">
    <template #title>
      <AppLogo
        aria-label="Navigation"
        @navigate="close"
      />
    </template>

    <div class="app-sidebar">
      <div class="app-sidebar__navigation">
        <span class="app-sidebar__navigation-title">Navigation</span>

        <AppNavigation @navigate="close" />
      </div>
    </div>

    <template #footer>
      <div class="app-sidebar__footer">
        <AppUser @navigate="close" />
      </div>
    </template>
  </BaseSidePanel>
</template>

<style scoped>
  .app-sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 var(--space-2);
  }

  .app-sidebar__navigation {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .app-sidebar__navigation-title {
    padding: var(--space-2);
  }

  .app-sidebar__footer {
    border-top: 1px solid var(--border);
  }
</style>
