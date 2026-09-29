<script setup lang="ts">
  import { DropdownMenuItem } from 'reka-ui'

  import BaseDropdown from '@/common/ui/BaseDropdown.vue'
  import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'
  import { useLogout } from '@/modules/auth/composables/useLogout'

  defineProps<{
    collapsed?: boolean
  }>()

  const emits = defineEmits<{
    navigate: []
  }>()

  const { data: user } = useCurrentUser()
  const { isLoading, mutateAsync: logout } = useLogout()

  const onLogout = async () => {
    try {
      await logout()
      emits('navigate')
      navigateTo({ name: 'index' })
    } catch {
      // Ignore
    }
  }
</script>

<template>
  <BaseDropdown>
    <template #trigger>
      <div class="user-info">
        <Icon
          name="lucide:circle-user"
          :size="24"
        />

        <p
          v-if="user?.username"
          class="user-info__name"
          :class="{ 'user-info__name--collapsed': collapsed }"
        >
          {{ user.username }}
        </p>
      </div>
    </template>

    <DropdownMenuItem
      class="dropdown__item user-info__logout"
      @click="onLogout"
    >
      <Icon
        name="lucide:delete"
        :size="24"
      />

      {{ isLoading ? 'Logging out...' : 'Logout' }}
    </DropdownMenuItem>
  </BaseDropdown>
</template>

<style scoped>
  .user-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
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

  .user-info__logout {
    color: var(--danger);
  }
</style>
