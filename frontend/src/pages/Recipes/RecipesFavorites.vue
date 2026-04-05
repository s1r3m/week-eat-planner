<template>
  <div id="favorites" class="space-y-6 m-6">
    <PageTitle header="Favorites" description="Recipes you have added to your collection" />
    <RecipesGrid :recipes="[]" />
  </div>
</template>

<script setup lang="ts">
import PageTitle from '@/components/shared/PageTitle.vue';
import RecipesGrid from '@/features/recipe/components/RecipesGrid.vue';
</script>
