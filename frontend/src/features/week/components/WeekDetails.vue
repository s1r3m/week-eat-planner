<template>
  <img
    :src="default_img"
    alt="Week Image"
    loading="lazy"
    class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
  />

  <div class="flex absolute bottom-0 z-10 bg-primary/50 h-16 w-full items-center">
    <h1 class="pl-8 text-lg font-semibold text-white drop-shadow-md">
      {{ week.name }}
    </h1>
  </div>
  <router-link
    :to="{ name: 'week', params: { id: week.id } }"
    class="absolute inset-0 z-20"
  ></router-link>

  <EditDeleteActions @edit="$emit('edit', week)" @delete="$emit('delete', week)" />
</template>

<script setup lang="ts">
import type { UserWeekMinimal } from '@/domain/week/models';
import EditDeleteActions from '@/components/shared/EditDeleteActions.vue';

defineProps<{ week: UserWeekMinimal }>();
defineEmits<{
  edit: [week: UserWeekMinimal];
  delete: [week: UserWeekMinimal];
}>();

const default_img = new URL('@/assets/weeks/week-fallback.jpg', import.meta.url).href;
</script>
