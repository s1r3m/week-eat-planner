<script setup lang="ts">
  import { useGlobalToast } from '@/common/composables/useGlobalToast'
  import BaseAlert from '@/common/ui/BaseAlert.vue'

  const { dismiss, toasts } = useGlobalToast()

  onMounted(() => {
    for (const toast of toasts.value) {
      setTimeout(() => dismiss(toast.id), toast.duration)
    }
  })
</script>

<template>
  <Teleport to="body">
    <div class="global-toast">
      <TransitionGroup name="toast">
        <BaseAlert
          v-for="toast in toasts"
          :key="toast.id"
          class="global-toast__item"
          :message="toast.message"
          :variant="toast.variant"
          @close="dismiss(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
  .global-toast {
    position: fixed;
    bottom: var(--space-5);
    right: var(--space-5);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    pointer-events: none;
  }

  .global-toast__item {
    max-width: 24.375rem;
    pointer-events: all;
  }

  .toast-enter-active {
    transition:
      opacity var(--duration-base) ease-out,
      transform var(--duration-base) cubic-bezier(0.16, 1, 0.3, 1);
  }

  .toast-leave-active {
    transition:
      opacity var(--duration-fast) ease-in,
      transform var(--duration-fast) ease-in;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(1.5rem);
  }

  .toast-move {
    transition: transform var(--duration-base) ease;
  }
</style>
