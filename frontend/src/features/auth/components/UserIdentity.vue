<template>
  <div class="flex items-center gap-3 text-lg">
    <Avatar class="size-10 cursor-pointer">
      <AvatarImage v-if="user.avatar_url" :src="user.avatar_url" :alt="displayName" />
      <AvatarFallback v-else> {{ avatarFallback }} </AvatarFallback>
    </Avatar>
    <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
      <span class="truncate font-semibold" :title="displayName">
        {{ displayName }}
      </span>
      <span class="truncate text-xs" :title="user.email">{{ user.email }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserData } from '@/api/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const props = defineProps<{
  user: UserData;
}>();

const displayName = computed(() => props.user.username || props.user.email.split('@')[0]);
const avatarFallback = computed(() => displayName.value.slice(0, 2).toUpperCase());
</script>
