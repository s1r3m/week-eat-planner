<template>
  <div class="flex items-center gap-3 py-1.5 text-left text-sm">
    <Avatar class="size-9 rounded-lg">
      <AvatarImage v-if="user.avatarUrl" :src="user.avatarUrl" :alt="displayName" />
      <AvatarFallback v-else class="rounded-lg"> {{ avatarFallback }} </AvatarFallback>
    </Avatar>
    <div class="grid flex-1 text-left text-sm leading-tight">
      <span class="truncate font-semibold" :title="displayName">
        {{ displayName }}
      </span>
      <span class="truncate text-xs" :title="user.email">{{ user.email }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserInfo } from '@/domain/auth/models';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const props = defineProps<{
  user: UserInfo;
}>();

const displayName = computed(() => props.user.username || props.user.email.split('@')[0]);
const avatarFallback = computed(() => displayName.value.slice(0, 2).toUpperCase());
</script>
