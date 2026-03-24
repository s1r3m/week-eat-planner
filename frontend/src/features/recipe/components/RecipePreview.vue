<template>
  <Card id="recipe-preview-container" variant="week" class="group relative overflow-hidden">
    <img
      :src="recipe.cover_url || defaultImg"
      :alt="recipe.name"
      loading="lazy"
      class="absolute bg-primary/10 inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
    />
    <div class="flex absolute bottom-0 z-10 bg-primary/50 h-16 w-full items-center justify-center">
      <h2 class="text-lg font-semibold text-white drop-shadow-md">
        {{ recipe.name }}
      </h2>
    </div>
    <router-link
      :to="{ name: ROUTE_NAMES.RECIPE, params: { id: recipe.id } }"
      class="absolute inset-0 z-20"
    ></router-link>
    <div class="flex gap-3 z-30 pointer-events-auto absolute top-2 right-2">
      <Button
        variant="outline"
        class="rounded-full bg-primary/30 backdrop-blur-lg"
        @click.stop="toggleFavorite"
      >
        <Star v-bind="starProps" />
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-vue-next';
import type { RecipeMinimal } from '@/domain/recipe/models';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const props = defineProps<{ recipe: RecipeMinimal }>();
const emit = defineEmits<{
  toggleFavorite: [recipe: RecipeMinimal];
}>();

const isFavorite = ref(props.recipe.isFavorite);

const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;
const starProps = computed(() => {
  return isFavorite.value
    ? {
        fill: 'var(--primary)',
        'stroke-width': '0',
      }
    : {};
});

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  emit('toggleFavorite', props.recipe);
};
</script>
