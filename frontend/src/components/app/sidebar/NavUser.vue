<template>
  <SidebarMenu>
    <SidebarMenuItem> </SidebarMenuItem>
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
