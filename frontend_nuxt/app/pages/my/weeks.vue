<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'
  import PageErrorState from '@/common/ui/PageErrorState.vue'
  import PageLoadingState from '@/common/ui/PageLoadingState.vue'
  import PageTitle from '@/common/ui/PageTitle.vue'
  import { useWeekDialog } from '@/modules/weeks/composables/useWeekDialog'
  import { useWeeks } from '@/modules/weeks/composables/useWeeks'
  import WeekCreateDialog from '@/modules/weeks/ui/WeekCreateDialog.vue'
  import WeekGrid from '@/modules/weeks/ui/WeekGrid.vue'

  definePageMeta({
    layout: 'app',
  })

  const { data: weeks, error, isLoading, refresh } = useWeeks()
  const { open } = useWeekDialog()
</script>

<template>
  <div class="page-container">
    <PageTitle name="My Weeks">
      <template #controls>
        <BaseButton
          aria-label="Create week"
          @click="open"
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

    <WeekCreateDialog />
  </div>
</template>

<style scoped>
  @media (--mobile) {
    .page-title__button-label {
      display: none;
    }
  }
</style>
