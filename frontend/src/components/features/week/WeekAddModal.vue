<template>
  <ModalBase
    :model-value="props.modelValue"
    eyebrow="Week Eat Planner"
    :title="`Add new Week`"
    subtitle="Fill the following form:"
    @close="$emit('close')"
  >
    <template #default>
      <form id="add-week-form" class="space-y-3" @submit.prevent="onCreate">
        <label for="week-name" class="text-sm font-semibold text-muted">New week name: </label>
        <input
          id="week-name"
          v-model="newName"
          type="text"
          placeholder="E.g. Week 1"
          class="w-full rounded-2xl border border-brand-muted bg-surface-base px-4 py-3 text-base text-base-color placeholder:text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
        />
      </form>
    </template>

    <template #footer>
      <RoundedButton @click="$emit('close')"> Cancel </RoundedButton>
      <RoundedButton variant="primary" :disabled="isDisabled" @click="onCreate">
        Create
      </RoundedButton>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import type { WeekPayload } from '@/types/week';
import { ref, computed } from 'vue';
import ModalBase from '@/components/ui/ModalBase.vue';
import RoundedButton from '@/components/ui/RoundedButton.vue';

interface Props {
  modelValue: boolean;
  processing?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  processing: false,
});

const newName = ref('');
const isDisabled = computed(() => !newName.value || props.processing);

const emit = defineEmits<{
  create: [data: WeekPayload];
  close: [];
}>();

const onCreate = () => {
  if (!newName.value) {
    return;
  }
  emit('create', { name: newName.value } as WeekPayload);
  newName.value = '';
};
</script>
