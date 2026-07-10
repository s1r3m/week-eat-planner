<template>
  <div v-if="week" id="weeks-page-container" class="space-y-6 m-6">
    <PageTitle header="Groceries">
      <template #controls>
        <Button
          variant="destructiveOutline"
          size="default"
          class="md:h-11 md:px-7 md:text-title-sm"
          aria-label="Delete week"
          @click="remove(week.id)"
          ><Trash /><span class="hidden md:inline"> Delete </span></Button
        >
      </template>
    </PageTitle>

    <ErrorRetryCard v-if="error" :error="error" :retry="refetch" />
    <ShoppingList
      v-else-if="shoppingList"
      :list="shoppingList.items"
      @check="update({ week_id: week.id, items: shoppingList.items })"
    />
    <TheLoadingPageState v-else-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery } from '@pinia/colada';
import { useRoute } from 'vue-router';
import {
  deleteShoppingListMutation,
  getShoppingListQuery,
  updateShoppingListMutation,
} from '@/api/shoppingList';
import { getWeekQuery } from '@/api/weeks';

import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import Button from '@/components/ui/button/Button.vue';
import ShoppingList from '@/features/ShoppingList/components/ShoppingList.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import { Trash } from 'lucide-vue-next';

const route = useRoute();
const {
  data: shoppingList,
  error,
  isLoading,
  refetch,
} = useQuery(() => getShoppingListQuery(String(route.params.id)));
const { data: week } = useQuery(getWeekQuery(String(route.params.id)));
const { mutate: update } = useMutation(updateShoppingListMutation());
const { mutate: remove } = useMutation(deleteShoppingListMutation());
</script>
