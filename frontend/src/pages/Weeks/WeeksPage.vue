<template>
  <div class="weeks-page-container">
    <div class="space-y-9 mb-9">
      <PageTitle header="My Weeks" description="Manage your weekly meal plans here" />
      <div class="grid gap-9 lg:grid-cols-2 lg:gap-12 2xl:grid-cols-3 2xl:gap-24 px-6">
        <Card v-for="week in weekStore.weeks" :key="week.id" variant="week">
          <WeekDetails :week="week" />
        </Card>
        <Card v-if="weekStore.weeks.length < 6" variant="empty">
          <WeekCreateForm />
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWeekStore, WeekDetails, WeekCreateForm } from '@/features/week';

import PageTitle from '@/components/shared/PageTitle.vue';
import { Card } from '@/components/ui/card';

const weekStore = useWeekStore();

await weekStore.fetchWeeks();
</script>
