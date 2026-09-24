<script setup lang="ts">
  import AppAuthControls from '@/modules/main/ui/AppAuthControls.vue'
  import AppLogo from '@/modules/main/ui/AppLogo.vue'
  import BaseButton from '@/common/ui/BaseButton.vue'
  import { useLogout } from '@/modules/auth/composables/useLogout'

  const { mutate: logout } = useLogout()
</script>

<template>
  <header class="guest-header">
    <AppLogo />

    <BaseButton
      variant="danger"
      @click="logout"
    >
      Logout
    </BaseButton>

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
    position: sticky;
    z-index: 2;
    align-items: center;
    justify-content: space-between;
    height: var(--header-height);
    border-bottom: 1px solid var(--color-outline);
    inset: 0;
    backdrop-filter: blur(--blur);
  }

  .guest-header__mobile-controls {
    display: block;
  }

  .guest-header__controls {
    display: none;
  }

  @media (--desktop) {
    .guest-header__mobile-controls {
      display: none;
    }

    .guest-header__controls {
      display: flex;
    }
  }
</style>
