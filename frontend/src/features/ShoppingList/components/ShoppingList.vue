<template>
  <ul class="divide-y divide-outline-variant/30">
    <li v-for="item in sortedList" :key="`${item.name}:${item.unit}`">
      <ShoppingListLine
        :item="item"
        @update="
          item.checked = $event;
          $emit('check');
        "
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ShoppingListItem } from '@/api/shoppingList.js';
import ShoppingListLine from '@/features/ShoppingList/components/ShoppingListLine.vue';

defineEmits<{
  check: [];
}>();
const props = defineProps<{ list: ShoppingListItem[] }>();
const sortedList = computed(() =>
  (props.list ?? [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
);
</script>
