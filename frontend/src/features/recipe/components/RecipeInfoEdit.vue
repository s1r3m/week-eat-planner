<template>
  <FieldGroup>
    <FieldTitle class="font-semibold text-lg text-primary">Recipe Info</FieldTitle>
    <FieldContent class="space-y-3">
      <FieldLabel for="recipe-name"> Name </FieldLabel>
      <Input id="recipe-name" v-model="name" type="text" placeholder="e.g Pasta Carbonara" />

      <FieldLabel for="recipe-cover"> Recipe Cover </FieldLabel>
      <Input
        id="recipe-cover"
        type="file"
        accept="image/*"
        class="file:-ml-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:cursor-pointer"
        @change="onFileChange"
      />

      <RecipeCover
        :src="img"
        :alt="name"
        class="p-0 h-36 md:h-48 w-full rounded-xl overflow-hidden"
      />
    </FieldContent>
  </FieldGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import RecipeCover from './RecipeCover.vue';
import { FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field';

const name = defineModel<string>('name', { required: true });
const cover = ref<File | null>(null);
const img = ref('');

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files?.length) return;

  cover.value = target.files[0];
  if (img.value) URL.revokeObjectURL(img.value);
  img.value = URL.createObjectURL(cover.value);
};
</script>
