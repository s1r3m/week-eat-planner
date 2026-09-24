<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'
  import PageTitle from '@/common/ui/PageTitle.vue'
  import PageLoadingState from '@/common/ui/PageLoadingState.vue'
  import PageErrorState from '@/common/ui/PageErrorState.vue'
  import { useWeeks } from '@/modules/weeks/composables/useWeeks'
  import WeekGrid from '@/modules/weeks/ui/WeekGrid.vue'

  definePageMeta({
    layout: 'app',
  })

  const { data: weeks, isLoading, refresh, error } = useWeeks()
</script>

<template>
  <div class="page-container">
    <PageTitle name="My Weeks">
      <template #controls>
        <BaseButton
          disabled
          aria-label="Create week"
          @click=""
        >
          <Icon
            name="lucide:plus"
            :size="24"
          />

          <span class="page-title__button-label">Create week</span>
        </BaseButton>
      </template>
    </PageTitle>

    <PageLoadingState
      v-if="!weeks?.length || isLoading"
      name="weeks"
    />

    <PageErrorState
      v-else-if="error"
      name="weeks"
      :error="error"
      @repeat="refresh"
    />

    <WeekGrid
      v-else
      :weeks="weeks ?? []"
    />
  </div>
</template>

<style scoped>
  .page-container {
    padding: var(--space-2);
  }

  .page-title__button-label {
    display: none;
  }

  @media (width > 768px) {
    .page-title__button-label {
      display: inline;
    }
  }
</style>
