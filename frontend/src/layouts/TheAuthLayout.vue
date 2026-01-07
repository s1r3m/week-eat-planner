<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AuthHeader />

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
import AuthHeader from '@/components/app/AuthHeader.vue';
</script>
