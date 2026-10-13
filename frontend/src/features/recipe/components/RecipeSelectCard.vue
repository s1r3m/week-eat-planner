<template>
  <div
    class="relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-medium2 ease-emphasized h-32 flex flex-col justify-between p-3 active:scale-[0.98] hover:scale-[1.01]"
    :class="
      isSelected ? 'border-primary bg-primary/8' : 'border-transparent bg-surface-container-low'
    "
    @click="emit('select', recipe)"
  >
    <img
      :src="recipe.image_url || defaultImg"
      :alt="recipe.name"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 opacity-50 group-hover:scale-110"
    />

    <!-- Top Row: Meal Type Badge or Star -->
    <div class="relative z-10 flex justify-end">
      <Button
        variant="secondary"
        size="icon-sm"
        class="rounded-full pointer-events-auto shadow-sm"
        :aria-label="recipe.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
        @click.stop="toggle({ id: recipe.id, is_favorite: recipe.is_favorite })"
      >
        <Star
          class="size-4"
          :class="recipe.is_favorite ? 'fill-primary text-primary' : 'text-on-surface-variant'"
        />
      </Button>
    </div>

    <!-- Bottom Row: Recipe Name -->
    <div class="relative z-10 flex w-full justify-center">
      <Badge variant="secondary" class="max-w-full truncate text-label-md text-center">
        {{ recipe.name }}
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toggleFavoriteMutation, type RecipePreview } from '@/api/recipes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@pinia/colada';
import { Star } from 'lucide-vue-next';

defineProps<{
  recipe: RecipePreview;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  select: [recipe: RecipePreview];
}>();

const { mutate: toggle } = useMutation(toggleFavoriteMutation());
const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;
</script>
