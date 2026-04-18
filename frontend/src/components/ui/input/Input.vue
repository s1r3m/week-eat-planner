<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { cn } from '@/lib/utils';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
}>();

const emits = defineEmits<{
  'update:modelValue': [payload: string | number];
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="
      cn(
        'file:text-on-surface placeholder:text-on-surface-variant selection:bg-primary/30 selection:text-on-surface border-outline h-12 w-full min-w-0 rounded-sm border bg-transparent px-4 py-2 text-body-lg transition-all outline-none disabled:pointer-events-none disabled:opacity-38',
        'focus-visible:border-primary focus-visible:border-2 focus-visible:ring-0',
        'aria-invalid:border-error',
        props.class,
      )
    "
  />
</template>
