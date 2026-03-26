<template>
  <SidebarGroup>
    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible v-for="item in navLinks" :key="item.label" :default-open="true">
        <SidebarMenuItem>
          <Suspense>
            <AppSidebarNavigationItem :item="item" />

            <template #fallback>
              <div>
                <p>Loading...</p>
              </div>
            </template>
          </Suspense>
          <template v-if="item.items">
            <CollapsibleTrigger as-child>
              <SidebarMenuAction class="data-[state=open]:rotate-90">
                <ChevronRight v-if="item.items.length > 0" />
                <span class="sr-only"> Toggle </span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.to.name">
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
import { computed, type ComputedRef } from 'vue';
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
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import type { NavLink } from '../header/types/navigation';

const weekStore = useWeekStore();
// if (!weekStore.isWeeksInitialized) {
//   await weekStore.fetchWeeks();
// }
const { weeks } = storeToRefs(weekStore);

const navLinks: ComputedRef<NavLink[]> = computed(() => [
  {
    label: 'My weeks',
    to: { name: ROUTE_NAMES.WEEKS },
    icon: Calendar,
    items: weeks.value.map((week) => ({
      to: { name: ROUTE_NAMES.WEEK, params: { id: week.id } },
      label: week.name,
    })),
  },
  {
    label: 'Recipes',
    to: { name: ROUTE_NAMES.RECIPES },
    icon: ForkKnife,
    items: [
      { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes' },
      { to: { name: ROUTE_NAMES.RECIPES_FAVORITES }, label: 'Favorites' },
    ],
  },
]);
</script>
