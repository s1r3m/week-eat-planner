<template>
  <CardContent @click.stop="handleAssignRecipe">
    <CardTitle class="text-center text-muted-foreground">
      {{ props.mealSlot.meal_type }}
    </CardTitle>
    <router-link
      v-if="props.mealSlot.recipe"
      :to="`/recipes/${props.mealSlot.recipe.id}`"
      class="absolute inset-0 z-20"
    />

    <CardDescription
      v-else
      class="flex items-center gap-1 text-sm font-light text-muted-foreground pt-2"
    >
      <Plus class="h-3 w-3" />Assign a recipe
    </CardDescription>

    <div class="absolute top-2 right-2 flex gap-2 z-40 pointer-events-auto">
      <Button v-if="!!props.mealSlot.recipe" class="btn-circle" @click.stop="handleAssignRecipe">
        <Pencil class="icon" />
      </Button>
      <Button v-if="!!props.mealSlot.recipe" class="btn-circle" @click.stop="handleRemoveRecipe">
        <Trash2 class="icon" />
      </Button>
    </div>
  </CardContent>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-vue-next';

import type { MealSlot } from '@/domain/week/models';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';

const props = defineProps<{
  mealSlot: MealSlot;
}>();

const handleAssignRecipe = () => {
  if (!props.mealSlot.recipe) {
    console.log(`Open AssignRecipe to slot ${props.mealSlot.id}`);
  }
};

const handleRemoveRecipe = () => {
  if (props.mealSlot.recipe) {
    console.log(`Delete ${props.mealSlot.recipe.name} to slot ${props.mealSlot.id}`);
  }
};
</script>

<style scoped>
@import 'tailwindcss';

.btn-circle {
  @apply p-2 rounded-full active:ring-1 bg-white/80 backdrop-blur;
}

.icon {
  @apply size-6 cursor-pointer;
}
</style>
