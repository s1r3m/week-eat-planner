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
      <span class="font-semibold text-brand-primary">{{ props.weekName }}</span
      >?
    </p>

    <template #footer>
      <button
        type="button"
        class="btn w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="props.processing"
        @click="$emit('close')"
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
