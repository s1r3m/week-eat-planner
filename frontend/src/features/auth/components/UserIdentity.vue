<template>
  <div class="flex items-center gap-3 py-1.5 text-left text-sm">
    <Avatar class="size-9 rounded-lg">
      <AvatarImage src="" alt="User Avatar" />
      <AvatarFallback class="rounded-lg"> UT </AvatarFallback>
    </Avatar>
    <div class="grid flex-1 text-left text-sm leading-tight">
      <span class="truncate font-semibold"> User Temporary </span>
      <span class="truncate text-xs">{{ user.email }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserInfo } from '@/app/api/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

defineProps<{
  user: UserInfo;
}>();
</script>
