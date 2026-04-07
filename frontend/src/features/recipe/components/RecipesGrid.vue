<template>
  <div v-if="!recipes.length">
    <Card
      class="flex flex-col gap-6 items-center-safe border-10 border-muted w-full p-6 mt-12 rounded-xl text-muted-foreground"
    >
      <Star :size="42" />
      <h2 class="text-lg">Nothing here yet</h2>
      <p>Browse our recipe collection to start planning!</p>
      <Button @click="router.push({ name: ROUTE_NAMES.RECIPES })">To recipes</Button>
    </Card>
  </div>
  <div v-else class="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
    <RecipePreviewCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { RecipePreview } from '@/api/recipes';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

import RecipePreviewCard from './RecipePreviewCard.vue';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-vue-next';

defineProps<{
  recipes: RecipePreview[];
}>();

const router = useRouter();
</script>
