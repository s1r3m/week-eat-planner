<script setup lang="ts">
  import {
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
  } from 'reka-ui'

  import BaseButton from '@/common/ui/BaseButton.vue'

  const open = defineModel<boolean>({ default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="side-panel__overlay" />

      <DialogContent class="side-panel">
        <div class="side-panel__header">
          <DialogTitle as-child>
            <slot name="title"></slot>
          </DialogTitle>

          <DialogClose
            aria-label="close"
            as-child
          >
            <BaseButton variant="icon">
              <Icon
                name="lucide:x"
                :size="24"
              />
            </BaseButton>
          </DialogClose>
        </div>

        <div class="side-panel__content">
          <slot></slot>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
