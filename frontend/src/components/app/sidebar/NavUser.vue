<template>
  <SidebarMenu>
    <SidebarMenuItem>
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
          <DropdownMenuItem @select="handleLogout"> <LogOut /> Log Out </DropdownMenuItem>
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
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/features/auth/store/auth';
import { useRouter } from 'vue-router';
import UserIdentity from '@/features/auth/components/UserIdentity.vue';
import type { UserInfo } from '@/app/api/types';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';

const { isMobile, setOpenMobile } = useSidebar();
const authStore = useAuthStore();
const router = useRouter();

defineProps<{
  user: UserInfo;
}>();

const { call: logout, isLoading } = useAsyncCall(authStore.logout);
const handleLogout = async () => {
  await logout();
  router.push('/');
};

const handleNavigation = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};
</script>
