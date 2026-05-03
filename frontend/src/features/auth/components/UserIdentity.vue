<template>
  <div class="flex items-center gap-3 text-lg">
    <Avatar class="size-10 cursor-pointer">
      <AvatarImage
        v-if="user.avatar_url"
        :src="user.avatar_url"
        :alt="user.username"
        referrer-policy="no-referrer"
      />
      <AvatarFallback> {{ user.username.slice(0, 2) }} </AvatarFallback>
    </Avatar>
    <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
      <span class="truncate font-semibold" :title="user.username">
        {{ user.username }}
      </span>
      <span class="truncate text-xs" :title="user.email">{{ user.email }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserData } from '@/api/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

defineProps<{ user: UserData }>();
</script>
