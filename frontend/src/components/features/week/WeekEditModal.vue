<template>
  <ModalBase
    :model-value="props.modelValue"
    eyebrow="Week Eat Planner"
    :title="`Edit ${props.weekName}`"
    subtitle="Update the name so the plan stays organized."
    @close="$emit('close')"
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
      <Button :disabled="props.saving" @click="$emit('close')"> Cancel </Button>
      <Button form="week-edit-form" :disabled="isSaveDisabled">
        {{ props.saving ? 'Saving...' : 'Save' }}
      </Button>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import ModalBase from '@/components/ui/ModalBase.vue';

import { Button } from '@/components/ui/button';

interface Props {
  modelValue: boolean;
  weekName: string;
  saving?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
});

const emit = defineEmits<{
  save: [string];
  close: [];
}>();

const localWeekName = ref(props.weekName);

watchEffect(() => {
  if (props.modelValue) {
    localWeekName.value = props.weekName;
  }
});

const isSaveDisabled = computed(
  () =>
    props.saving || !localWeekName.value.trim() || localWeekName.value.trim() === props.weekName,
);

const handleSave = () => {
  if (isSaveDisabled.value) {
    return;
  }
  emit('save', localWeekName.value.trim());
};
</script>
