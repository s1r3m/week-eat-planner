<template>
  <div class="weeks-page-container">
    <div class="space-y-6 m-6">
      <PageTitle header="My Weeks" description="Manage your weekly meal plans here">
        <template #controls>
          <Button size="lg" aria-label="Add a new week" @click="isCreateOpen = true">
            <Plus />
            <span class="hidden md:inline">Add a new week</span>
          </Button>
        </template>
      </PageTitle>

      <TheLoadingPageState v-if="isLoading" />
      <div v-else-if="error" class="flex justify-center-safe">
        <div
          class="flex flex-col gap-6 items-center-safe border-2 border-muted w-full p-6 mt-6 rounded-xl"
        >
          <MessageCircleX :size="42" />
          <h2 class="font-semibold text-lg">An error has occured during loading</h2>
          <p class="text-muted-foreground">{{ error.message }}</p>
          <Button @click="refetch"> Try again</Button>
        </div>
      </div>
      <WeeksGrid v-else-if="weeks" :weeks="weeks" />
    </div>

    <WeekCreateDialog v-model="isCreateOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@pinia/colada';
import { WeeksGrid, WeekCreateDialog } from '@/features/week';
import { Button } from '@/components/ui/button';
import { MessageCircleX, Plus } from 'lucide-vue-next';

import PageTitle from '@/components/shared/PageTitle.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import { getWeeks, WEEK_KEYS } from '@/api/weeks';

const {
  data: weeks,
  isLoading,
  error,
  refetch,
} = useQuery({
  key: WEEK_KEYS.all,
  query: () => getWeeks(),
});

const isCreateOpen = ref(false);
</script>
