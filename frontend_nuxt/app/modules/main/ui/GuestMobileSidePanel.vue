<script setup lang="ts">
  import BaseSidePanel from '@/common/ui/BaseSidePanel.vue'
  import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
  import AppAuthControls from '@/modules/main/ui/AppAuthControls.vue'
  import AppLogo from '@/modules/main/ui/AppLogo.vue'

  const { close, isOpen } = useMobileSidebar()

  const onNavigate = () => {
    close()
  }
</script>

<template>
  <BaseSidePanel v-model="isOpen">
    <template #title>
      <AppLogo />
    </template>

    <div class="guest-sidebar">
      <AppAuthControls @navigate="onNavigate" />
    </div>
  </BaseSidePanel>
</template>

<style scoped>
  .guest-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-2);
  }
</style>
