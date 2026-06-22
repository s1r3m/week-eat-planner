<template>
  <form class="mx-auto max-w-7xl" @submit.prevent="onSubmit">
    <div class="flex flex-col gap-6">
      <RecipeInfoEdit :initial-image="recipe.image_url" />
      <FieldSeparator />
      <RecipeIngredientsEdit />
      <FieldSeparator />
      <RecipeStepsEdit />
      <div class="flex gap-3 justify-end-safe">
        <Button variant="outline" type="button" @click="$emit('cancel')"> Cancel </Button>
        <Button type="submit"> Save changes </Button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { recipeFormSchema } from '../schemas';

import { type RecipeFull, type RecipePayload } from '@/api/recipes';

import RecipeInfoEdit from './RecipeInfoEdit.vue';
import RecipeIngredientsEdit from './RecipeIngredientsEdit.vue';
import RecipeStepsEdit from './RecipeStepsEdit.vue';
import { FieldSeparator } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  recipe: RecipeFull;
}>();

const emit = defineEmits<{
  update: [payload: RecipePayload, image: File | null];
  cancel: [];
}>();

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(recipeFormSchema),
  initialValues: {
    name: props.recipe.name,
    image: null,
    ingredients: [...props.recipe.ingredients, { name: '', amount: 0, unit: 'g' }],
    steps: [...props.recipe.steps, { step: '', order: props.recipe.steps.length + 1 }],
  },
});

const onSubmit = handleSubmit((values) => {
  emit(
    'update',
    {
      name: values.name,
      ingredients: values.ingredients.slice(0, -1),
      steps: values.steps.slice(0, -1),
      is_public: true,
    },
    values.image || null,
  );
});
</script>
