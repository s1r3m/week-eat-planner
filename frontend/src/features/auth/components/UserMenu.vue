<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <SidebarMenuButton size="lg">
        <UserIdentity :user="user" />
        <ChevronsUpDown class="ml-auto size-4" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      :side="isMobile ? 'bottom' : 'right'"
      class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
      align="end"
      :side-offset="4"
    >
      <DropdownMenuLabel class="p-0 font-normal">
        <UserIdentity :user="user" />
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem as-child>
          <router-link
            to="/profile"
            class="flex w-full items-center gap-2"
            @click="handleNavigation"
          >
            <BadgeCheck />
            Profile
          </router-link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell />
          Notifications
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        :disabled="isLoggingOut"
        :variant="isLoggingOut ? 'destructive' : 'default'"
        @select="handleLogout"
      >
        <Spinner v-if="isLoggingOut" class="text-destructive" />
        <LogOut v-else />
        {{ isLoggingOut ? 'Loggin out' : 'Log out' }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import UserIdentity from '@/features/auth/components/UserIdentity.vue';
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-vue-next';
</script>
