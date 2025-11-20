<template>
  <ModalBase
    :model-value="modelValue"
    eyebrow="Week planner"
    :title="modalTitle"
    subtitle="This action cannot be undone."
    :close-on-backdrop="!props.processing"
    @update:modelValue="updateVisibility"
    @close="handleClose"
  >
    <p class="text-base text-base-color">
      Are you sure you want to delete
      <span class="font-semibold text-brand-primary">{{ weekName || 'this week' }}</span
      >?
    </p>

    <template #footer>
      <button
        type="button"
        class="btn w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="props.processing"
        @click="handleNo"
      >
        No
      </button>
      <button
        type="button"
        class="btn btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="props.processing"
        @click="handleYes"
      >
        {{ props.processing ? 'Deleting...' : 'Yes' }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ModalBase from '@/components/ui/ModalBase.vue';

interface Props {
  modelValue: boolean;
  weekName?: string;
  processing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  processing: false,
});

const emit = defineEmits<{
  'update:modelValue': [boolean];
  confirm: [];
  close: [];
  cancel: [];
}>();

const modalTitle = computed(() => (props.weekName ? `Delete ${props.weekName}?` : 'Delete week?'));

const updateVisibility = (value: boolean) => {
  emit('update:modelValue', value);
};

const handleClose = () => {
  emit('cancel');
  emit('close');
};

const handleYes = () => {
  if (props.processing) {
    return;
  }
  emit('confirm');
};

const handleNo = () => {
  emit('update:modelValue', false);
  emit('cancel');
  emit('close');
};
</script>
