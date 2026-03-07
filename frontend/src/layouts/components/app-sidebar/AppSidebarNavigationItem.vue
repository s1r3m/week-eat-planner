<template>
  <component
    :is="variant === 'default' ? SidebarMenuButton : SidebarMenuSubButton"
    :is-active="isActiveLink(item.to)"
    as-child
  >
    <router-link :to="item.to" @click="handleNavigation">
      <component :is="item.icon" v-if="item.icon" />
      <span> {{ item.label }} </span>
    </router-link>
  </component>
</template>

<script setup lang="ts">
import { useSidebar } from '@/components/ui/sidebar';
import SidebarMenuButton from '@/components/ui/sidebar/SidebarMenuButton.vue';
import SidebarMenuSubButton from '@/components/ui/sidebar/SidebarMenuSubButton.vue';
import type { NavLink } from '@/layouts/components/header/types/navigation';
import { useRoute } from 'vue-router';

const { item, variant = 'default' } = defineProps<{
  item: NavLink;
  variant?: 'default' | 'child';
}>();

const route = useRoute();
const isActiveLink = (path: string) => route.path === path;

const { isMobile, setOpenMobile } = useSidebar();
const handleNavigation = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};
</script>
