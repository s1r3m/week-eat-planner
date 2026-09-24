<script setup lang="ts">
  import { useSidebar } from '@/common/composables/useSidebar'
  import BaseButton from '@/common/ui/BaseButton.vue'
  import { useLogout } from '@/modules/auth/composables/useLogout'
  import ModeSwitch from '@/modules/main/ui/ModeSwitch.vue'

  const { collapsed, toggleCollapsed } = useSidebar()

  const { error, isLoading, mutate: logout } = useLogout()
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
        disabled
      >
        <Icon
          name="lucide:menu"
          :size="24"
        />
      </BaseButton>

      <span
        v-if="error"
        role="alert"
      >
        {{ error.message }}
      </span>

      <BaseButton
        :disabled="isLoading"
        variant="danger"
        @click="logout"
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
    padding: var(--space-2);
    border-bottom: 1px solid var(--border);
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

  .app-header__mobile-menu {
    display: block;
  }

  @media (--desktop) {
    .app-header__mobile-menu {
      display: none;
    }
  }
</style>
