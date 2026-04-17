<template>
  <div
    class="relative group cursor-pointer overflow-hidden rounded-lg border-2 transition-all h-32 flex items-center justify-center"
    :class="isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent bg-muted'"
    @click="emit('select', recipe)"
  >
    <img
      :src="recipe.image_url || defaultImg"
      :alt="recipe.name"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 opacity-50 group-hover:scale-110"
    />

    <Badge variant="secondary" class="relative z-10">
      {{ recipe.name }}
    </Badge>

    <Button
      variant="secondary"
      class="rounded-full absolute right-2 top-2 z-20 pointer-events-auto"
      :aria-label="recipe.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
      @click.stop="toggle({ id: recipe.id, is_favorite: recipe.is_favorite })"
    >
      <Star v-bind="starProps" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { toggleFavoriteMutation, type RecipePreview } from '@/api/recipes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@pinia/colada';
import { computed } from 'vue';
import { Star } from 'lucide-vue-next';

const props = defineProps<{
  recipe: RecipePreview;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  select: [recipe: RecipePreview];
}>();

const { mutate: toggle } = useMutation(toggleFavoriteMutation());
const starProps = computed(() => {
  return props.recipe.is_favorite
    ? {
        fill: 'var(--primary)',
        strokeWidth: 0,
      }
    : {};
});
const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;
</script>
