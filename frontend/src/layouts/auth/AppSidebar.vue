<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            class="pl-0 group-data-[collapsible=icon]:pl-0! active:text-brand-primary hover:bg-transparent hover:text-brand-primary"
          >
            <router-link to="/" class="flex items-center justify-start text-brand-primary">
              <div
                class="flex size-10 shrink-0 bg-transparent group-data-[collapsible=icon]:size-10"
              >
                <img
                  class="h-full w-full object-contain"
                  src="@/assets/logo.png"
                  alt="Week Eat Planner logo"
                />
              </div>

              <span
                class="text-lg font-semibold tracking-tight md:text-xl group-data-[collapsible=icon]:hidden"
              >
                Week Eat Planner
              </span>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import NavUser from '@/layouts/auth/NavUser.vue';
import NavMain from '@/layouts/auth/NavMain.vue';

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset',
});

const user = {
  name: 'user',
  email: 'test@example.com',
  avatar: '',
};
</script>
