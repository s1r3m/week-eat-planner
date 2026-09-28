<script setup lang="ts">
  import { DialogClose } from 'reka-ui'

  import type { WeekCreatePayload } from '@/modules/weeks/types'

  import BaseButton from '@/common/ui/BaseButton.vue'
  import BaseDialog from '@/common/ui/BaseDialog.vue'
  import BaseInput from '@/common/ui/BaseInput.vue'
  import { useCreateWeek } from '@/modules/weeks/composables/useCreateWeek'
  import { useWeekDialog } from '@/modules/weeks/composables/useWeekDialog'

  const { close, isOpen } = useWeekDialog()
  const { mutate: create, isLoading } = useCreateWeek()

  const form = ref<WeekCreatePayload>({ name: '' })

  const onSubmit = async () => {
    if (!form.value.name.trim()) return

    try {
      await create(form.value)
      close()
    } catch {
      form.value.name = ''
    }
  }
</script>

<template>
  <BaseDialog
    v-model="isOpen"
    title="Create a new week"
  >
    <form
      class="form"
      @submit.prevent="onSubmit"
    >
      <BaseInput
        v-model="form.name"
        label="Name"
        placeholder="e.g. Week 1"
      />

      <div class="form__controls">
        <DialogClose as-child>
          <BaseButton variant="secondary">Cancel</BaseButton>
        </DialogClose>

        <BaseButton
          type="submit"
          :disabled="!form.name.trim() || isLoading"
        >
          {{ isLoading ? 'Creating...' : 'Create' }}
        </BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .form__controls {
    display: flex;
    gap: var(--space-2);
  }

  .form__controls > * {
    width: 100%;
  }
</style>
