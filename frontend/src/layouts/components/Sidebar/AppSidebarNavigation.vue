<template>
  <SidebarGroup>
    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible v-for="item in navLinks" :key="item.label" :default-open="true">
        <SidebarMenuItem>
          <AppSidebarNavigationItem :item="item" />

          <template v-if="item.items">
            <CollapsibleTrigger as-child>
              <SidebarMenuAction class="data-[state=open]:rotate-90">
                <ChevronRight v-if="item.items.length > 0" />
                <span class="sr-only"> Toggle </span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.to">
                  <AppSidebarNavigationItem :item="subItem" variant="child" />
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </template>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Calendar, ChevronRight, ForkKnife } from 'lucide-vue-next';
import { useWeekStore } from '@/features/week';
import AppSidebarNavigationItem from './AppSidebarNavigationItem.vue';

const weekStore = useWeekStore();
const { weeks } = storeToRefs(weekStore);
const navLinks = computed(() => [
  {
    label: 'My weeks',
    to: '/weeks',
    icon: Calendar,
    items: weeks.value.map((week) => ({
      to: `/weeks/${week.id}`,
      label: week.name,
    })),
  },
  {
    label: 'Recipes',
    to: '/recipes',
    icon: ForkKnife,
    items: [
      { to: '#', label: 'My recipes' },
      { to: '#', label: 'Favorites' },
      { to: '#', label: 'Ready weeks' },
    ],
  },
]);
</script>
