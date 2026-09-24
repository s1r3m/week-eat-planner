<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'
  import PageErrorState from '@/common/ui/PageErrorState.vue'
  import PageLoadingState from '@/common/ui/PageLoadingState.vue'
  import PageTitle from '@/common/ui/PageTitle.vue'

  definePageMeta({
    // middleware: 'auth',
    layout: 'app',
  })

  const recipes = ref([])
  const isLoadingRecipes = ref(false)
  const error = ref()
  const refetch = () => {}
</script>

<template>
  <div class="page-container">
    <PageTitle name="My Recipes">
      <template #controls>
        <BaseButton aria-label="Create recipe">
          <Icon name="lucide:plus" />

          <span class="page-title__button-label">Create recipe</span>
        </BaseButton>
      </template>
    </PageTitle>

    <PageLoadingState
      v-if="!recipes && isLoadingRecipes"
      name="recipes"
    />

    <PageErrorState
      v-else-if="error"
      name="recipes"
      :error="error"
      @retry="refetch"
    />

    <!-- <RecipeGrid
      v-else
      :recipes="recipes"
    /> -->
  </div>
</template>

<style scoped>
  .page-title__button-label {
    display: none;
  }

  @media (width > 768px) {
    .page-title__button-label {
      display: inline;
    }
  }
</style>
