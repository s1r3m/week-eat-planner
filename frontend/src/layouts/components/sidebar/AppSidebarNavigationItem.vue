<template>
  <component
    :is="variant === 'default' ? SidebarMenuButton : SidebarMenuSubButton"
    :is-active="isActiveLink(item)"
    as-child
  >
    <router-link :to="item.to" :aria-label="item.label" @click="handleNavigation">
      <component :is="item.icon" v-if="item.icon" class="size-6" />
      <span class="group-data-[collapsible=icon]:sr-only"> {{ item.label }} </span>
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
const isActiveLink = (navLink: NavLink) => {
  if (navLink.to.params) return route.path.includes(navLink.to.params.id);
  return route.name === navLink.to.name;
};

const { isMobile, setOpenMobile } = useSidebar();
const handleNavigation = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};
</script>
