<template>
  <div class="weeks-page-container">
    <div class="space-y-6 m-6">
      <PageTitle header="My Weeks" description="Manage your weekly meal plans here">
        <template #controls>
          <div class="flex items-center gap-3">
            <Loader2 v-if="isLoading" class="animate-spin text-muted-foreground" :size="20" />
            <Button size="lg" aria-label="Add a new week" @click="isCreateOpen = true">
              <Plus />
              <span class="hidden md:inline">Add a new week</span>
            </Button>
          </div>
        </template>
      </PageTitle>

      <div v-if="error" class="flex justify-center-safe">
        <div
          class="flex flex-col gap-6 items-center-safe border-2 border-muted w-full p-6 mt-6 rounded-xl text-muted-foreground"
        >
          <MessageCircleX :size="42" />
          <h2 class="text-lg">An error has occurred during loading</h2>
          <p>{{ error.message }}</p>
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
import { MessageCircleX, Plus, Loader2 } from 'lucide-vue-next';

import PageTitle from '@/components/shared/PageTitle.vue';
import { getWeeksQuery } from '@/api/weeks';

const { data: weeks, error, refetch, isLoading } = useQuery(getWeeksQuery());

const isCreateOpen = ref(false);
</script>
