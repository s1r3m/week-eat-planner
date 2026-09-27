<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'
  import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
  import AppAuthControls from '@/modules/main/ui/AppAuthControls.vue'
  import AppLogo from '@/modules/main/ui/AppLogo.vue'
  import GuestMobileSidePanel from '@/modules/main/ui/GuestMobileSidePanel.vue'
  import ModeSwitch from '@/modules/main/ui/ModeSwitch.vue'

  const { open } = useMobileSidebar()
</script>

<template>
  <header class="guest-header">
    <AppLogo />

    <div class="guest-header__controls-wrapper">
      <ModeSwitch />

      <AppAuthControls class="guest-header__controls" />

      <BaseButton
        class="guest-header__mobile-menu"
        variant="icon"
        @click="open"
      >
        <Icon
          name="lucide:menu"
          :size="24"
        />
      </BaseButton>
    </div>

    <GuestMobileSidePanel />
  </header>
</template>

<style scoped>
  .guest-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    inset: 0;
    position: sticky;
    z-index: 2;
    padding: var(--space-2);
    height: var(--header-height);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(var(--blur));
  }

  .guest-header__controls-wrapper {
    display: flex;
    align-items: center;
  }

  .guest-header__mobile-menu {
    display: none;
  }

  @media (--mobile) {
    .guest-header__mobile-menu {
      display: flex;
    }

    .guest-header__controls {
      display: none;
    }
  }
</style>
