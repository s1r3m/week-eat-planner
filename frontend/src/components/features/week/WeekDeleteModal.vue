<template>
  <ModalBase
    :model-value="modelValue"
    eyebrow="Week planner"
    :title="`Delete ${props.weekName}?`"
    subtitle="This action cannot be undone."
    @close="$emit('close')"
  >
    <p class="text-base text-base-color">
      Are you sure you want to delete
      <span class="font-semibold text-danger">{{ props.weekName }}</span
      >?
    </p>

    <template #footer>
      <RoundedButton @click="$emit('close')">No</RoundedButton>
      <RoundedButton variant="danger" :disabled="props.processing" @click="handleYes">
        {{ props.processing ? 'Deleting...' : 'Yes' }}
      </RoundedButton>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import ModalBase from '@/components/ui/ModalBase.vue';

import RoundedButton from '@/components/ui/RoundedButton.vue';

interface Props {
  modelValue: boolean;
  weekName?: string;
  processing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  processing: false,
});

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();

const handleYes = () => {
  if (props.processing) {
    return;
  }
  emit('confirm');
};
</script>
