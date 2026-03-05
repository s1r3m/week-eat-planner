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
          :side="isMobile ? 'bottom' : 'right'"
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel v-if="authStore.user" class="font-normal">
            <UserIdentity :user="authStore.user" />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem as-child>
              <router-link
                to="/profile"
                class="flex w-full items-center gap-3"
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
          <DropdownMenuItem>
            <router-link to="/promo" class="flex w-full items-center gap-3" @click="logout">
              <LogOut />
              Log Out
            </router-link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<script setup lang="ts">
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/features/auth/store/auth';
import UserIdentity from '@/features/auth/components/UserIdentity.vue';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';

const { isMobile, setOpenMobile } = useSidebar();
const authStore = useAuthStore();

const { call: logout } = useAsyncCall(authStore.logout);

const handleNavigation = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};
</script>
