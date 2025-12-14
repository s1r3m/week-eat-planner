<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="h-13 flex transition-[width,height] ease-linear border-b mb-4">
        <div class="flex flex-1 items-center">
          <div class="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1 size-10" />
            <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
            <TheBreadcrumbs />
          </div>
          <ModeToggle />
        </div>
      </header>

      <router-view v-slot="{ Component }">
        <template v-if="Component">
          <component :is="Component" />
        </template>
      </router-view>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import ModeToggle from '@/components/ui/ModeToggle.vue';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/layouts/auth/AppSidebar.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import TheBreadcrumbs from './auth/TheBreadcrumbs.vue';
</script>
