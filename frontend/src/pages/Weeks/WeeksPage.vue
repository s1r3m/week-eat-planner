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

      <WeeksGrid :weeks="weekStore.weeks" />
    </div>

    <WeekCreateDialog v-model="isCreateOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWeekStore, WeeksGrid, WeekCreateDialog } from '@/features/week';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-vue-next';

import PageTitle from '@/components/shared/PageTitle.vue';

const weekStore = useWeekStore();
await weekStore.fetchWeeks();

const isCreateOpen = ref(false);
</script>
