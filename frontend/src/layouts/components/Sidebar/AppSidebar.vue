<template>
  <Sidebar variant="inset">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            class="p-0 group-data-[collapsible=icon]:pl-0! hover:bg-transparent active:bg-transparent"
          >
            <AppBrand />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <AppSidebarNavigation />
    </SidebarContent>
    <SidebarFooter>
      <AppSidebarFooter />
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import AppBrand from '@/components/shared/AppBrand.vue';
import AppSidebarNavigation from './AppSidebarNavigation.vue';
import AppSidebarFooter from './AppSidebarFooter.vue';
</script>
