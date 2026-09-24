<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'

  definePageMeta({
    layout: 'app',
  })

  const weeks = ref([])
  const error = ref()
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
          <Icon name="lucide:plus" />

          <span class="page-title__button-label">Create week</span>
        </BaseButton>
      </template>
    </PageTitle>

    <PageLoadingState
      v-if="!weeks?.length"
      name="weeks"
    />

    <PageErrorState
      v-else-if="error"
      name="weeks"
      :error="error"
      @repeat=""
    />

    <WeekGrid
      v-else
      :weeks="weeks ?? []"
    />
  </div>
</template>

<style scoped>
  .page-title__button-label {
    display: none;
  }

  @media (width > 768px) {
    .page-title__button-label {
      display: inline;
    }
  }
</style>
