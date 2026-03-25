<template>
  <Card>
    <CardTitle class="mx-6 font-semibold">Recipe Info</CardTitle>
    <CardContent class="space-y-3">
      <Label for="recipe-name"> Name </Label>
      <Input id="recipe-name" v-model="name" type="text" placeholder="e.g Pasta Carbonara" />

      <Label for="recipe-cover"> Recipe Cover </Label>
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
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RecipeCover from './RecipeCover.vue';

const name = ref('');
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
