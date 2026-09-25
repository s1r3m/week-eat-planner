<script setup lang="ts">
  import type { WeekPreview } from '@/modules/weeks/types'

  import PageEmptyState from '@/common/ui/PageEmptyState.vue'
  import WeekCard from '@/modules/weeks/ui/WeekCard.vue'

  defineProps<{
    weeks: WeekPreview[]
  }>()
</script>

<template>
  <div
    v-if="weeks.length"
    class="week-grid"
  >
    <WeekCard
      v-for="week in weeks"
      :key="week.id"
      :week="week"
    />
  </div>

  <PageEmptyState
    v-else
    name="weeks"
  />
</template>

<style scoped>
  .week-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
    margin: var(--space-2) 0;
  }

  @container (--tablet) {
    .week-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @container (--mobile) {
    .week-grid {
      grid-template-columns: repeat(1, 1fr);
    }
  }
</style>
