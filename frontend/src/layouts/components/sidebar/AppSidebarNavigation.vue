<template>
  <SidebarGroup>
    <div class="flex items-center justify-between pr-4">
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <Loader2 v-if="isLoading" class="animate-spin text-muted-foreground" :size="16" />
    </div>
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
import { useQuery } from '@pinia/colada';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import type { NavLink } from '../header/types/navigation';
import { getWeeksQuery } from '@/api/weeks';

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
import { Calendar, ChevronRight, ForkKnife, Loader2, BookOpenText, Star } from 'lucide-vue-next';
import AppSidebarNavigationItem from './AppSidebarNavigationItem.vue';

const { data: weeks, isLoading } = useQuery(getWeeksQuery());

const navLinks: ComputedRef<NavLink[]> = computed(() => [
  {
    label: 'My weeks',
    to: { name: ROUTE_NAMES.WEEKS },
    icon: Calendar,
    items: weeks.value?.map((week) => ({
      to: { name: ROUTE_NAMES.WEEK, params: { id: week.id } },
      label: week.name,
    })),
  },
  {
    label: 'Recipes',
    to: { name: ROUTE_NAMES.RECIPES },
    icon: ForkKnife,
  },
  { to: { name: ROUTE_NAMES.RECIPES_MY }, label: 'My recipes', icon: BookOpenText },
  { to: { name: ROUTE_NAMES.RECIPES_FAVORITES }, label: 'Favorites', icon: Star },
]);
</script>
