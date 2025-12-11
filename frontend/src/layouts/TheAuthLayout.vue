<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-13 shrink-0 items-center transition-[width,height] ease-linear">
        <div class="flex items-center">
          <div class="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink as-child>
                    <router-link to="/weeks">Weeks</router-link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Xmas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import AppSidebar from '@/layouts/auth/AppSidebar.vue';
import Separator from '@/components/ui/separator/Separator.vue';
</script>
