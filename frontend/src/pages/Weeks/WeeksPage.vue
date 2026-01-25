<template>
  <template v-if="weekStore.error">
    <div>
      <h3>Could not load your weeks at the moment. Please try again.</h3>
      <Button :disabled="weekStore.isFetchingWeeks" @click="weekStore.fetchWeeks()"
        >Retry now</Button
      >
    </div>
  </template>

  <template v-else-if="weekStore.isFetchingWeeks">
    <TheLoadingPageState loading-name="weeks" />
  </template>

  <template v-else>
    <div class="space-y-8 mb-8">
      <PageTitle header="My Weeks" description="Manage your weekly meal plans here" />
      <div class="grid gap-8 lg:grid-cols-2 lg:gap-12 2xl:grid-cols-3 2xl:gap-24 px-8">
        <Card v-for="week in weekStore.weeks" :key="week.id" variant="week">
          <WeekDetails :week="week" />
        </Card>
        <Card v-if="weekStore.weeks.length < 6" variant="empty">
          <WeekCreateForm />
        </Card>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useWeekStore } from '@/features/week/store/weeks';

import WeekDetails from '@/features/week/components/WeekDetails.vue';
import WeekCreateForm from '@/features/week/components/WeekCreateForm.vue';
import { Button } from '@/components/ui/button';
import TheLoadingPageState from '@/components/app/TheLoadingPageState.vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import { Card } from '@/components/ui/card';

const weekStore = useWeekStore();

onMounted(async () => {
  await weekStore.fetchWeeks();
});
</script>
