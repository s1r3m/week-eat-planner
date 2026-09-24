<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'
  import PageErrorState from '@/common/ui/PageErrorState.vue'
  import PageLoadingState from '@/common/ui/PageLoadingState.vue'
  import PageTitle from '@/common/ui/PageTitle.vue'
  import { useWeeks } from '@/modules/weeks/composables/useWeeks'
  import WeekGrid from '@/modules/weeks/ui/WeekGrid.vue'

  definePageMeta({
    layout: 'app',
  })

  const { data: weeks, error, isLoading, refresh } = useWeeks()
</script>

<template>
  <div class="page-container">
    <PageTitle name="My Weeks">
      <template #controls>
        <BaseButton
          disabled
          aria-label="Create week"
          @click="() => {}"
        >
          <Icon
            name="lucide:plus"
            :size="24"
          />

          <span class="page-title__button-label">Create week</span>
        </BaseButton>
      </template>
    </PageTitle>

    <PageErrorState
      v-if="error"
      name="weeks"
      :error="error"
      @retry="refresh"
    />

    <PageLoadingState
      v-else-if="isLoading || !weeks"
      name="weeks"
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
