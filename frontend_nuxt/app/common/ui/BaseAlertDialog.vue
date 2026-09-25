<script setup lang="ts">
  import {
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
    VisuallyHidden,
  } from 'reka-ui'

  defineProps<{
    description: string
    title: string
    titleHidden?: boolean
  }>()
  const open = defineModel<boolean>({ default: false })
</script>

<template>
  <ClientOnly>
    <AlertDialogRoot v-model:open="open">
      <AlertDialogPortal>
        <AlertDialogOverlay class="alert-dialog__overlay" />

        <AlertDialogContent class="alert-dialog__content">
          <VisuallyHidden v-if="titleHidden">
            <AlertDialogTitle>{{ title }}</AlertDialogTitle>
          </VisuallyHidden>

          <AlertDialogTitle v-else>{{ title }}</AlertDialogTitle>

          <AlertDialogDescription class="alert-dialog__description">
            {{ description }}
          </AlertDialogDescription>

          <div class="alert-dialog__controls">
            <slot></slot>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </ClientOnly>
</template>
