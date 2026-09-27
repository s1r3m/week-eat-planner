<script setup lang="ts">
  import { useSidebar } from '@/common/composables/useSidebar'
  import BaseButton from '@/common/ui/BaseButton.vue'
  import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
  import ModeSwitch from '@/modules/main/ui/ModeSwitch.vue'

  const { collapsed, toggleCollapsed } = useSidebar()
  const { open } = useMobileSidebar()
</script>

<template>
  <header class="app-header">
    <div class="app-header__left-side">
      <BaseButton
        variant="icon"
        @click="toggleCollapsed"
      >
        <Icon
          :name="
            collapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'
          "
          :size="24"
        />
      </BaseButton>
    </div>

    <div class="app-header__center">
      <div class="breadcrumbs">My Weeks -> temp</div>
    </div>

    <div class="app-header__right-side">
      <ModeSwitch />

      <BaseButton
        class="app-header__mobile-menu"
        variant="icon"
        @click="open"
      >
        <Icon
          name="lucide:menu"
          :size="24"
        />
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: 1px solid var(--border);
    background-color: color-mix(in srgb, var(--bg) 70%, transparent);
    backdrop-filter: blur(16px);
  }

  .app-header__left-side {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .app-header__right-side {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .app-header__center {
    flex: 1;
  }

  .app-header__mobile-menu {
    display: none;
  }

  @media (--mobile) {
    .app-header__mobile-menu {
      display: block;
    }

    .app-header__left-side {
      display: none;
    }
  }
</style>
