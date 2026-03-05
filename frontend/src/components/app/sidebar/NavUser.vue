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
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

const { isMobile, setOpenMobile } = useSidebar();
const isLoggingOut = ref(false);
const authStore = useAuthStore();
const router = useRouter();

defineProps<{
  user: UserInfo;
}>();

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;
  try {
    await authStore.logout();
  } finally {
    isLoggingOut.value = false;
    router.push('/');
  }
};

const handleNavigation = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};
</script>
