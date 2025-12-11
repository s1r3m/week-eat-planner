<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <div class="flex items-center h-8">
        <router-link
          to="/"
          class="flex items-center gap-2 text-foreground hover:text-foreground/80"
        >
          <img class="h-10 w-auto" src="@/assets//logo.png" alt="Week Eat Planner logo" />
          <span class="text-lg font-semibold tracking-tight text-brand-primary md:text-xl"
            >Week Eat Planner</span
          >
        </router-link>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <nav class="flex flex-col gap-2 mt-3">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-2 rounded-md transition-colors font-medium"
          :class="
            isActiveLink(link.to)
              ? 'bg-brand-primary/15 text-brand-primary'
              : 'text-base-color/70 hover:text-base-color'
          "
        >
          {{ link.label }}
        </router-link>
      </nav>
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import NavUser from '@/layouts/auth/NavUser.vue';
import { useWeekStore } from '@/stores/weeks';

const route = useRoute();
const activePath = computed(() => route.path);
const isActiveLink = (path: string) => activePath.value.startsWith(path);
const weekStore = useWeekStore();

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset',
});

const navLinks = [
  { label: 'Weeks', to: '/weeks' },
  { label: 'Recipes', to: '/recipes' },
];

const user = {
  name: 'user',
  email: 'test@example.com',
  avatar: '',
};
</script>
