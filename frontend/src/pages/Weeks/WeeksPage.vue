<template>
  <div class="weeks-page-container">
    <div class="space-y-6 m-6">
      <PageTitle header="My Weeks" description="Manage your weekly meal plans here">
        <template #controls>
          <div class="flex items-center gap-3">
            <Loader2 v-if="isLoading" class="animate-spin text-muted-foreground" :size="20" />
            <Button aria-label="Add a new week" @click="isCreateOpen = true">
              <Plus />
              <span class="hidden md:inline">Add a new week</span>
            </Button>
          </div>
        </template>
      </PageTitle>

      <ErrorRetryCard v-if="error" :error="error" :retry="refetch" />
      <WeeksGrid v-else-if="weeks" :weeks="weeks" />
      <TheLoadingPageState v-else-if="isLoading" />
    </div>

    <WeekCreateDialog v-model="isCreateOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuery } from '@pinia/colada';
import { WeeksGrid, WeekCreateDialog } from '@/features/week';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-vue-next';

import PageTitle from '@/components/shared/PageTitle.vue';
import { getWeeksQuery } from '@/api/weeks';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';

const { data: weeks, error, refetch, isLoading } = useQuery(getWeeksQuery());

const isCreateOpen = ref(false);
</script>
