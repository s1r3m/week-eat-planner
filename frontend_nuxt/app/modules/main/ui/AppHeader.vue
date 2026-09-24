<script setup lang="ts">
  import { useSidebar } from '@/common/composables/useSidebar'
  import { useAuthStore } from '@/modules/auth/stores/auth'
  import BaseButton from '@/common/ui/BaseButton.vue'
  import ModeSwitch from '@/modules/main/ui/ModeSwitch.vue'

  const { collapsed, toggleCollapsed } = useSidebar()

  const { logout } = useAuthStore()

  const logoutError = ref<string | null>(null)
  const isLoggingOut = ref(false)
  const onLogout = async () => {
    isLoggingOut.value = true
    logoutError.value = null
    try {
      await logout()
      await navigateTo('/')
    } catch {
      logoutError.value = 'An error occured during logout. Carry on.'
    } finally {
      isLoggingOut.value = false
    }
  }
</script>

<template>
  <header class="app-header">
    <div class="app-header__left-side">
      <BaseButton
        class="menu-btn"
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

      <div class="breadcrumbs">My Weeks -> temp</div>
    </div>

    <div class="app-header__right-side">
      <ModeSwitch />

      <BaseButton
        class="app-header__mobile-menu"
        variant="icon"
      >
        <Icon
          name="lucide:menu"
          :size="24"
        />
      </BaseButton>

      <span
        v-if="logoutError"
        role="alert"
      >
        {{ logoutError }}
      </span>

      <BaseButton
        :disabled="isLoggingOut"
        variant="danger"
        @click="onLogout"
      >
        Logout
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-outline);
  }

  .app-header__left-side {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .app-header__right-side {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .app-header__mobile-menu {
    display: block;
  }

  @media (--desktop) {
    .app-header__mobile-menu {
      display: none;
    }
  }
</style>
