<script setup lang="ts">
  import { useSidebar } from '@/composables/layout/useSidebar'
  import { useAuthStore } from '@/modules/auth/stores/auth'

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
      logoutError.value = 'Unable to log out. Please try again.'
    } finally {
      isLoggingOut.value = false
    }
  }
</script>

<template>
  <header class="app-header">
    <div class="app-header__left-side">
      <UiButton
        class="menu-btn"
        variant="icon"
        @click="toggleCollapsed"
      >
        <Icon
          :name="
            collapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'
          "
        />
      </UiButton>

      <div class="breadcrumbs">My Weeks -> temp</div>
    </div>

    <div class="app-header__right-side">
      <UiModeSwitch />

      <UiButton
        class="app-header__mobile-menu"
        variant="icon"
      >
        <Icon name="lucide:menu" />
      </UiButton>

      <span
        v-if="logoutError"
        role="alert"
      >
        {{ logoutError }}
      </span>
      <UiButton
        :disabled="isLoggingOut"
        variant="danger"
        @click="onLogout"
      >
        Logout
      </UiButton>
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

  @media (width > 480px) {
    .app-header__mobile-menu {
      display: none;
    }
  }
</style>
