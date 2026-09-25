<script setup lang="ts">
  import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'

  defineProps<{
    collapsed: boolean
  }>()

  const { data: user } = useCurrentUser()
</script>

<template>
  <div class="user-info">
    <Icon name="lucide:circle-user" />

    <p
      v-if="user?.username"
      class="user-info__name"
      :class="{ 'user-info__name--collapsed': collapsed }"
    >
      {{ user.username }}
    </p>
  </div>
</template>

<style scoped>
  .user-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
  }

  .user-info__name {
    max-width: 100%;
    overflow: hidden;
    opacity: 1;
    white-space: nowrap;
    transition:
      opacity,
      max-width var(--duration-base) ease;
  }

  .user-info__name--collapsed {
    max-width: 0;
    opacity: 0;
  }
</style>
