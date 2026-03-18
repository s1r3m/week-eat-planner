<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger v-if="authStore.user" as-child>
          <SidebarMenuButton size="lg">
            <UserIdentity :user="authStore.user" />
            <ChevronsUpDown class="ml-auto size-3" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem v-for="link in menuItems" :key="link.to" as-child>
              <router-link
                :to="link.to"
                class="flex w-full items-center gap-3"
                @click="link.action"
              >
                <component :is="link.icon" />
                {{ link.label }}
              </router-link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <router-link
              to="/promo"
              class="flex w-full items-center gap-3 text-destructive"
              @click="logout"
            >
              <LogOut /> Log Out
            </router-link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<script setup lang="ts">
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore, UserIdentity } from '@/features/auth';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import type { NavLink } from '@/layouts/components/header/types/navigation';

const authStore = useAuthStore();
const { isMobile, setOpenMobile } = useSidebar();
const { call: logout } = useAsyncCall(authStore.logout);

const handleNavigation = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};

const menuItems: NavLink[] = [
  { to: '/profile', label: 'Profile', icon: BadgeCheck, action: handleNavigation },
];
</script>
