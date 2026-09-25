<script setup lang="ts">
  import AppAuthControls from '@/modules/main/ui/AppAuthControls.vue'
  import AppLogo from '@/modules/main/ui/AppLogo.vue'
</script>

<template>
  <header class="guest-header">
    <AppLogo />

    <AppAuthControls class="guest-header__controls" />

    <Icon
      class="guest-header__mobile-controls"
      name="lucide:menu"
      :size="24"
    />
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
    height: var(--header-height);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(var(--blur));
  }

  .guest-header__mobile-controls {
    display: none;
  }

  @media (--mobile) {
    .guest-header__mobile-controls {
      display: block;
    }

    .guest-header__controls {
      display: none;
    }
  }
</style>
