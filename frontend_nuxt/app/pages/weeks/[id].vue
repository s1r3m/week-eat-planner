<script setup lang="ts">
  import BaseButton from '@/common/ui/BaseButton.vue'
  import PageErrorState from '@/common/ui/PageErrorState.vue'
  import PageLoadingState from '@/common/ui/PageLoadingState.vue'
  import PageTitle from '@/common/ui/PageTitle.vue'
  import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'
  import { useWeek } from '@/modules/weeks/composables/useWeek'
  import SlotGrid from '@/modules/weeks/ui/SlotGrid.vue'

  definePageMeta({
    layout: 'app',
  })

  const route = useRoute()
  const { data: week, error, refetch } = useWeek(route.params.id as string)
  const { data: user } = useCurrentUser()
</script>

<template>
  <div class="page-container">
    <PageTitle
      v-if="week"
      :name="week.name"
    >
      <template
        v-if="user"
        #controls
      >
        <BaseButton aria-label="Groceries">
          <Icon
            name="lucide:shopping-cart"
            :size="24"
          />

          <span class="page-title__button-label">Groceries</span>
        </BaseButton>

        <BaseButton
          variant="danger"
          disabled
          aria-label="Delete week"
          @click="() => {}"
        >
          <Icon
            name="lucide:trash"
            :size="24"
          />

          <span class="page-title__button-label">Delete week</span>
        </BaseButton>
      </template>
    </PageTitle>

    <PageErrorState
      v-else-if="error"
      name="weeks"
      :error="error"
      @retry="refetch"
    />

    <PageLoadingState
      v-else
      name="weeks"
    />

    <SlotGrid
      v-if="week"
      :week="week"
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
