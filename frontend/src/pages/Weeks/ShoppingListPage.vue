<template>
  <div id="weeks-page-container" class="space-y-6 m-6">
    <PageTitle header="Shopping list">
      <Button variant="destructiveOutline">Delete</Button>
    </PageTitle>

    <ErrorRetryCard v-if="error" :error="error" :retry="refetch" />
    <ShoppingList v-else-if="shoppingList" :list="shoppingList" />
    <TheLoadingPageState v-else-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { getShoppingListQuery } from '@/api/shoppingList';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import Button from '@/components/ui/button/Button.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import { useQuery } from '@pinia/colada';
import { useRoute } from 'vue-router';

const route = useRoute();
const {
  data: shoppingList,
  error,
  isLoading,
  refetch,
} = useQuery(() => getShoppingListQuery(String(route.params.id)));
</script>
