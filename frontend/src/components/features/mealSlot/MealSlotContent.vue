<template>
  <div class="content">
    <img src="@/assets/add_week_bg_1.png" alt="Add recipe image" class="background" />
    <div
      class="gradient-layout"
      :class="gradientColor[mealSlot.meal_type]"
      @click="handleAssignRecipe"
    ></div>

    <router-link
      v-if="props.mealSlot.recipe"
      :to="`/recipes/${props.mealSlot.recipe.id}`"
      class="absolute inset-0 z-20"
    ></router-link>

    <div class="controls">
      <RoundedButton
        v-if="!!props.mealSlot.recipe"
        class="btn-circle"
        @click.stop="handleAssignRecipe"
      >
        <Icon icon="mdi:pencil" class="icon" />
      </RoundedButton>
      <RoundedButton
        v-if="!!props.mealSlot.recipe"
        class="btn-circle"
        @click.stop="handleRemoveRecipe"
      >
        <Icon icon="mdi:trash-can-outline" class="icon" />
      </RoundedButton>
    </div>
    <h3>{{ mealSlot.meal_type }}</h3>
  </div>
</template>

<script setup lang="ts">
import RoundedButton from '@/components/ui/RoundedButton.vue';
import { Icon } from '@iconify/vue';

import type { MealSlot, MealType } from '@/types/api';

const props = defineProps<{
  mealSlot: MealSlot;
}>();

const gradientColor: Record<MealType, string> = {
  BREAKFAST: 'from-accent-breakfast/50 via-accent-breakfast/10',
  LUNCH: 'from-accent-lunch/50 via-accent-lunch/10',
  DINNER: 'from-accent-dinner/50 via-accent-dinner/10',
  SNACK: 'from-accent-snacks/50 via-accent-snacks/10',
};

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
@import '@/theme.css';
@import 'tailwindcss';

.content {
  @apply relative rounded-2xl overflow-hidden;

  .background {
    @apply w-full h-full object-cover object-center z-0;
  }

  .gradient-layout {
    @apply absolute inset-0 z-10 bg-linear-to-t to-transparent;
  }

  .controls {
    @apply absolute top-2 right-2 flex gap-2 z-40 pointer-events-auto;
  }

  h3 {
    @apply absolute bottom-2 w-full text-center text-2xl font-semibold z-30 pointer-events-none;
  }
}

.btn-circle {
  @apply p-2 rounded-full active:ring-1 bg-white/80 backdrop-blur;
}

.icon {
  @apply size-6 cursor-pointer;
}
</style>
