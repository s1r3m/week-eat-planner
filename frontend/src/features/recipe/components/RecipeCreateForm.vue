<template>
  <form @submit.prevent="onSubmit" class="mx-auto max-w-7xl">
    <div class="flex flex-col gap-6">
      <RecipeInfoEdit />
      <FieldSeparator />
      <RecipeIngredientsEdit />
      <FieldSeparator />
      <RecipeStepsEdit />
      <div class="flex gap-3 justify-end-safe">
        <Button variant="outline" type="button" @click="$emit('cancel')"> Cancel </Button>
        <Button type="submit"> Create recipe </Button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { recipeFormSchema } from '../schemas';

import { type RecipePayload } from '@/api/recipes';

import RecipeInfoEdit from './RecipeInfoEdit.vue';
import RecipeIngredientsEdit from './RecipeIngredientsEdit.vue';
import RecipeStepsEdit from './RecipeStepsEdit.vue';
import { FieldSeparator } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

const emit = defineEmits<{
  create: [payload: RecipePayload, image: File | null];
  cancel: [];
}>();

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(recipeFormSchema),
  initialValues: {
    name: '',
    image: null,
    ingredients: [{ name: '', amount: 0, unit: 'g' }],
    steps: [{ step: '', order: 1 }],
  },
});

const onSubmit = handleSubmit((values) => {
  emit(
    'create',
    {
      name: values.name,
      ingredients: values.ingredients.slice(0, -1),
      steps: values.steps.slice(0, -1),
      is_public: true,
    },
    values.image || null,
  );
});

defineExpose({
  errors,
});
</script>
