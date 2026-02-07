<template>
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem v-for="link in links" :key="link.to">
        <NavigationMenuLink as-child :class="navigationMenuTriggerStyle()">
          <router-link :to="link.to"> {{ link.label }} </router-link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>

<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export interface NavLink {
  label: string;
  to: string;
  children?: { to: string; label: string };
}

defineProps<{
  links: NavLink[];
}>();
</script>
