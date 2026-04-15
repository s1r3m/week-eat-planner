<template>
  <Card
    class="group p-0 gap-0 relative overflow-hidden"
    :class="{ 'opacity-50 pointer-events-none': recipe.id.startsWith('temp-id') }"
  >
    <div class="flex flex-1 justify-center items-center aspect-3/2 overflow-hidden">
      <img
        :src="recipe.image_url || defaultImg"
        :alt="recipe.name"
        loading="lazy"
        class="bg-primary/10 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    </div>
    <div class="flex flex-col bg-muted p-3">
      <h2 class="text-lg">
        {{ recipe.name }}
      </h2>
      <p class="text-muted-foreground text-sm">{{ recipe.author }}</p>
    </div>
    <router-link
      v-if="clickable"
      :to="{ name: ROUTE_NAMES.RECIPE, params: { id: recipe.id } }"
      class="absolute inset-0 z-10"
    ></router-link>
    <div class="flex gap-3 absolute right-2 top-2 z-20 pointer-events-auto">
      <Button
        variant="secondary"
        class="rounded-full"
        :aria-label="recipe.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
        @click.stop="toggle({ id: recipe.id, is_favorite: recipe.is_favorite })"
      >
        <Star v-bind="starProps" />
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMutation } from '@pinia/colada';
import { toggleFavoriteMutation } from '@/api/recipes';
import type { RecipePreview } from '@/api/recipes';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-vue-next';

const props = defineProps<{ recipe: RecipePreview; clickable?: boolean }>();
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
