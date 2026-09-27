<script setup lang="ts">
  import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
  import AppAuthControls from '@/modules/main/ui/AppAuthControls.vue'
  import AppLogo from '@/modules/main/ui/AppLogo.vue'
  import GuestMobileSidePanel from '@/modules/main/ui/GuestMobileSidePanel.vue'

  const { open } = useMobileSidebar()
</script>

<template>
  <header class="guest-header">
    <AppLogo />

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

  .guest-header__mobile-menu {
    padding: var(--space-2);
    display: none;
  }

  @media (--mobile) {
    .guest-header__mobile-menu {
      display: block;
    }

    .guest-header__controls {
      display: none;
    }
  }
</style>
