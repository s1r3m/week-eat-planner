<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="absolute inset-0 bg-base-color/70 backdrop-blur-sm"
          @click="handleBackdropClick"
        ></div>
        <div
          class="relative z-10 w-full max-w-xl rounded-3xl border border-brand-muted/70 bg-surface-raised p-6 shadow-2xl sm:p-8 lg:max-w-2xl"
        >
          <header class="flex items-start gap-4">
            <div class="flex-1 space-y-1">
              <p
                v-if="eyebrow"
                class="text-sm font-semibold uppercase tracking-wide text-brand-primary"
              >
                {{ eyebrow }}
              </p>
              <h3 v-if="title" class="text-2xl font-bold text-base-color">
                {{ title }}
              </h3>
              <p v-if="subtitle" class="text-base text-muted">
                {{ subtitle }}
              </p>
            </div>
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-muted/70 text-base-color transition hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              type="button"
              aria-label="Close dialog"
              @click="close"
            >
              <Icon icon="mdi:close" class="h-5 w-5" />
            </button>
          </header>
          <section class="mt-4 text-base text-base-color">
            <slot />
          </section>
          <footer
            v-if="$slots.footer"
            class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface Props {
  modelValue: boolean;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  closeOnBackdrop: true,
});

const emit = defineEmits<{
  'update:modelValue': [boolean];
  close: [];
}>();

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close();
  }
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
