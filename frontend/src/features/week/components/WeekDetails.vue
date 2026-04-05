<template>
  <Card
    class="relative group gap-0 p-0 overflow-hidden"
    :class="{ 'opacity-50 pointer-events-none': week.id.startsWith('temp-id') }"
  >
    <div class="flex flex-1 justify-center items-center aspect-3/2 overflow-hidden">
      <img
        :src="default_img"
        :alt="`${week.name} cover image`"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    </div>
    <div class="flex h-16 bg-muted p-3 items-center">
      <h2 class="text-lg font-semibold">
        {{ week.name }}
      </h2>
    </div>
    <router-link
      :to="{ name: 'week', params: { id: week.id } }"
      :aria-label="`Open week ${week.name}`"
      class="absolute inset-0 z-10"
    ></router-link>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card';
import type { UserWeekMinimal } from '@/domain/week/models';

defineProps<{ week: UserWeekMinimal }>();

const default_img = new URL('@/assets/weeks/week-fallback.jpg', import.meta.url).href;
</script>
