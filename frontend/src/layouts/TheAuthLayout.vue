<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AuthAppHeader />

      <router-view v-slot="{ Component }">
        <template v-if="Component">
          <component :is="Component" />
        </template>
      </router-view>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app/sidebar/AppSidebar.vue';
import { AuthAppHeader } from '@/components/header';
</script>
