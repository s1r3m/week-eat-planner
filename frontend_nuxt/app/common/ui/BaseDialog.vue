<script setup lang="ts">
  import {
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
  } from 'reka-ui'

  defineProps<{
    description?: string
    title: string
  }>()

  const open = defineModel<boolean>({ default: false })
</script>

<template>
  <ClientOnly>
    <DialogRoot v-model:open="open">
      <DialogPortal>
        <DialogOverlay class="base-dialog__overlay" />

        <DialogContent class="base-dialog__content">
          <DialogTitle class="base-dialog__title">{{ title }}</DialogTitle>

          <DialogDescription
            v-if="description"
            class="base-dialog__description"
          >
            {{ description }}
          </DialogDescription>

          <slot></slot>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </ClientOnly>
</template>
