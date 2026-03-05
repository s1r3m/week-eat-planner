<template>
  <Sidebar v-bind="props">
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
      <NavMain />
    </SidebarContent>
    <SidebarFooter v-if="user">
      <NavUser :user="user" />
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
  type SidebarProps,
} from '@/components/ui/sidebar';
import NavUser from './NavUser.vue';
import NavMain from './NavMain.vue';
import { useAuthStore } from '@/features/auth';
import AppBrand from '@/components/shared/AppBrand.vue';

const { user } = useAuthStore();

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset',
});
</script>
