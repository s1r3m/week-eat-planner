<script setup lang="ts">
  import { AlertDialogCancel } from 'reka-ui'

  import BaseAlertDialog from '@/common/ui/BaseAlertDialog.vue'
  import BaseButton from '@/common/ui/BaseButton.vue'
  import { useDeleteWeek } from '@/modules/weeks/composables/useDeleteWeek'
  import { useWeekDeleteDialog } from '@/modules/weeks/composables/useWeekDeleteDialog'

  const { close, isOpen, week } = useWeekDeleteDialog()
  const { mutate: remove, isLoading } = useDeleteWeek()

  const onConfirm = () => {
    if (!week.value) return

    remove(week.value.id)
    close()
    navigateTo({ name: 'my-weeks' })
  }
</script>

<template>
  <BaseAlertDialog
    v-model="isOpen"
    title="Delete week"
    :description="`Are you sure you want to delete ${week?.name}?`"
    title-hidden
  >
    <AlertDialogCancel as-child>
      <BaseButton variant="secondary">No</BaseButton>
    </AlertDialogCancel>

    <BaseButton
      variant="danger"
      :disabled="isLoading"
      @click="onConfirm"
    >
      {{ isLoading ? 'Deleting...' : 'Yes' }}
    </BaseButton>
  </BaseAlertDialog>
</template>
