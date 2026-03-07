<template>
  <div class="auth-layout-container h-full">
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AuthAppHeader />

        <router-view v-slot="{ Component, route }">
          <Suspense v-if="Component" timeout="0">
            <template #default>
              <Transition name="fade" mode="out-in">
                <component :is="Component" :key="route.fullPath" />
              </Transition>
            </template>
            <template #fallback>
              <TheLoadingPageState loading-name="the page" />
            </template>
          </Suspense>
        </router-view>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>

<script setup lang="ts">
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/layouts/components/sidebar/AppSidebar.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import AuthAppHeader from './components/header/auth/AuthAppHeader.vue';
</script>
