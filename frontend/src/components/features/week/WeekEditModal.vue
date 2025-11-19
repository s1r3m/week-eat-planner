<template>
  <ModalBase
    :model-value="modelValue"
    eyebrow="Week planner"
    :title="modalTitle"
    subtitle="Update the name so the plan stays organized."
    @update:modelValue="updateVisibility"
    @close="handleClose"
  >
    <form id="week-edit-form" class="space-y-3" @submit.prevent="handleSave">
      <label for="week-name" class="text-sm font-semibold text-muted">Week name</label>
      <input
        id="week-name"
        v-model="localWeekName"
        type="text"
        name="week-name"
        placeholder="E.g. Week 1"
        class="w-full rounded-2xl border border-brand-muted bg-surface-base px-4 py-3 text-base text-base-color placeholder:text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
      />
    </form>

    <template #footer>
      <button type="button" class="btn w-full sm:w-auto" @click="handleCancel">Cancel</button>
      <button
        type="submit"
        class="btn btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
        form="week-edit-form"
        :disabled="isSaveDisabled"
      >
        {{ props.saving ? 'Saving...' : 'Save' }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ModalBase from '@/components/ui/ModalBase.vue';

interface Props {
  modelValue: boolean;
  weekName?: string;
  saving?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
});

const emit = defineEmits<{
  'update:modelValue': [boolean];
  save: [string];
  close: [];
}>();

const localWeekName = ref(props.weekName ?? '');

watch(
  () => props.weekName,
  (newName) => {
    localWeekName.value = newName ?? '';
  },
);

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      localWeekName.value = props.weekName ?? '';
    }
  },
);

const modalTitle = computed(() => (props.weekName ? `Edit ${props.weekName}` : 'Edit week'));

const isSaveDisabled = computed(() => props.saving || !localWeekName.value.trim());

const updateVisibility = (value: boolean) => {
  emit('update:modelValue', value);
};

const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  if (isSaveDisabled.value) {
    return;
  }
  emit('save', localWeekName.value.trim());
};

const handleCancel = () => {
  emit('update:modelValue', false);
  emit('close');
};
</script>
