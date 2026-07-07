<template>
  <label
    class="flex min-h-12 w-full cursor-pointer items-center gap-3 px-4 transition-colors hover:bg-surface-container-low select-none"
    :class="{ 'opacity-50': item.checked }"
  >
    <Checkbox v-model="item.checked" @update:model-value="$emit('update')" />
    <IngredientItem
      :name="item.name"
      :amount="item.amount"
      :unit="item.unit"
      class="grow transition-all"
      :class="{ 'line-through text-primary': item.checked }"
    >
      <template #amount>
        <span :class="item.checked ? 'text-inherit' : 'text-on-surface-variant/70'">
          {{ item.amount }} {{ item.unit }}
        </span>
      </template>
    </IngredientItem>
  </label>
</template>

<script setup lang="ts">
import type { ShoppingListItem } from '@/api/shoppingList';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import IngredientItem from '@/components/shared/IngredientItem.vue';

defineProps<{ item: ShoppingListItem }>();
defineEmits<{
  update: [];
}>();
</script>
