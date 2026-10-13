<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger v-if="user" as-child>
          <SidebarMenuButton size="lg">
            <UserIdentity :user="user" />
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
            <DropdownMenuItem v-for="link in menuItems" :key="link.to.name" as-child>
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
              :to="{ name: ROUTE_NAMES.HOME }"
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
import { UserIdentity } from '@/features/auth';
import type { NavLink } from '@/layouts/components/header/types/navigation';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation, useQuery } from '@pinia/colada';
import { logoutMutation } from '@/api/auth';
import { getUserQuery } from '@/api/user';

const { isMobile, setOpenMobile } = useSidebar();
const { mutate: logout } = useMutation(logoutMutation());
const { data: user } = useQuery(getUserQuery());

const handleNavigation = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};

const menuItems: NavLink[] = [
  {
    to: { name: ROUTE_NAMES.PROFILE },
    label: 'Profile',
    icon: BadgeCheck,
    action: handleNavigation,
  },
];
</script>
