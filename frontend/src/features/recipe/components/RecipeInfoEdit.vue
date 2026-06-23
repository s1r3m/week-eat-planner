<template>
  <FieldGroup>
    <FieldContent class="space-y-3">
      <FieldLabel for="recipe-name"> Name </FieldLabel>
      <Input
        id="recipe-name"
        v-model="name"
        type="text"
        placeholder="e.g Pasta Carbonara"
        autocomplete="off"
      />
      <FieldError> {{ error }}</FieldError>

      <FieldLabel for="recipe-cover"> Recipe Cover </FieldLabel>
      <Input
        id="recipe-cover"
        type="file"
        accept="image/*"
        autocomplete="off"
        class="file:-ml-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:cursor-pointer"
        @change="onFileChange"
      />

      <RecipeCover
        :src="img"
        :alt="name"
        class="p-0 h-48 md:h-108 w-full rounded-xl overflow-hidden"
      />
    </FieldContent>
  </FieldGroup>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';

import { useField } from 'vee-validate';
import type * as zod from 'zod';
import { recipeInfoSchema } from '../schemas';

import { Input } from '@/components/ui/input';
import RecipeCover from './RecipeCover.vue';
import { FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

const props = defineProps<{
  initialImage?: string | null;
}>();

const img = ref(props.initialImage || '');

watch(
  () => props.initialImage,
  (newVal) => {
    if (newVal && !cover.value) {
      img.value = newVal;
    }
  },
);

type FormValues = zod.infer<typeof recipeInfoSchema>;

const { value: name, errorMessage: error } = useField<FormValues['name']>('name');
const { value: cover } = useField<FormValues['image']>('image');

onUnmounted(() => {
  if (img.value && img.value.startsWith('blob:')) {
    URL.revokeObjectURL(img.value);
  }
});

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  cover.value = file;
  if (img.value && img.value.startsWith('blob:')) {
    URL.revokeObjectURL(img.value);
  }
  img.value = URL.createObjectURL(file);
};
</script>
