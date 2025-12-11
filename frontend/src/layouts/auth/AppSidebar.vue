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
      <NavMain />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import NavUser from '@/layouts/auth/NavUser.vue';
import NavMain from '@/layouts/auth/NavMain.vue';

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset',
});

const user = {
  name: 'user',
  email: 'test@example.com',
  avatar: '',
};
</script>
