<template>
  <SidebarGroup>
    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible v-for="item in navLinks" :key="item.label" :default-open="true">
        <SidebarMenuItem>
          <SidebarMenuButton as-child :is-active="isActiveLink(item.to)">
            <router-link :to="item.to" @click="handleNavigation">
              <component :is="item.icon" />
              <span> {{ item.label }} </span>
            </router-link>
          </SidebarMenuButton>
          <template v-if="item.items">
            <CollapsibleTrigger as-child>
              <SidebarMenuAction class="data-[state=open]:rotate-90">
                <ChevronRight v-if="item.items.length > 0" />
                <span class="sr-only"> Toggle </span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.id">
                  <SidebarMenuSubButton as-child :is-active="isActiveLink(`/weeks/${subItem.id}`)">
                    <router-link :to="`/weeks/${subItem.id}`" @click="handleNavigation">
                      <span> {{ subItem.name }} </span>
                    </router-link>
                  </SidebarMenuSubButton>
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
import { useRoute } from 'vue-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Calendar, ChevronRight, ForkKnife } from 'lucide-vue-next';
import { useWeekStore } from '@/features/week';

const weekStore = useWeekStore();
const { weeks } = storeToRefs(weekStore);
const route = useRoute();

const isActiveLink = (path: string) => route.path === path;

const navLinks = computed(() => [
  {
    label: 'My weeks',
    to: '/weeks',
    icon: Calendar,
    items: weeks.value,
  },
  { label: 'Recipes', to: '/recipes', icon: ForkKnife },
]);

const { isMobile, setOpenMobile } = useSidebar();
const handleNavigation = () => {
  if (isMobile.value) {
    setOpenMobile(false);
  }
};
</script>
