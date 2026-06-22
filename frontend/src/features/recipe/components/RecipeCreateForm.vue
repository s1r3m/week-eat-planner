<template>
  <div class="mx-auto max-w-7xl">
    <div class="flex flex-col gap-6">
      <RecipeInfoEdit v-model:name="name" v-model:cover="image" />
      <FieldSeparator />
      <RecipeIngredientsEdit v-model:ingredients="ingredients" />
      <FieldSeparator />
      <RecipeStepsEdit v-model:steps="steps" />
      <div class="flex gap-3 justify-end-safe">
        <Button variant="outline" @click="$emit('cancel')"> Cancel </Button>
        <Button
          :disabled="!name.trim() || ingredients.length < 2 || steps.length < 2"
          @click="
            $emit(
              'create',
              {
                name,
                ingredients: ingredients.slice(0, -1),
                steps: steps.slice(0, -1),
                is_public: true,
              },
              image,
            )
          "
        >
          Create recipe
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ingredient, CookingStep, RecipePayload } from '@/api/recipes';
import RecipeInfoEdit from './RecipeInfoEdit.vue';
import RecipeIngredientsEdit from './RecipeIngredientsEdit.vue';
import RecipeStepsEdit from './RecipeStepsEdit.vue';
import { FieldSeparator } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

const name = ref('');
const steps = ref<CookingStep[]>([]);
const ingredients = ref<Ingredient[]>([]);
const image = ref<File | null>(null);

defineEmits<{
  create: [payload: RecipePayload, image: File | null];
  cancel: [];
}>();
</script>
