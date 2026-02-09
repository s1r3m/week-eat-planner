<template>
  <AppHeader class="transition-[width,height] ease-linear">
    <template #left>
      <div class="flex items-center">
        <SidebarTrigger class="-ml-1 size-10" />
        <Separator orientation="vertical" class="data-[orientation=vertical]:h-4" />
      </div>
    </template>

    <template #center>
      <AuthAppBreadcrumbs />
    </template>

    <template #right>
      <ModeToggle />
    </template>
  </AppHeader>
</template>

<script setup lang="ts">
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppHeader from '@/components/header/AppHeader.vue';
import ModeToggle from '@/components/shared/ModeToggle.vue';

import AuthAppBreadcrumbs from './AuthAppBreadcrumbs.vue';

import Separator from '@/components/ui/separator/Separator.vue';
</script>
