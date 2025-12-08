<template>
  <div class="min-h-screen bg-surface-base text-base-color flex flex-col">
    <header class="border-b border-base-color/10 bg-surface-raised px-6 py-4">
      <div class="flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-3">
          <img class="max-w-14" src="@/assets//logo.png" alt="logo" />
        </router-link>
        <router-link to="/weeks" class="flex items-center gap-3">
          <h1 class="text-3xl font-medium">Week Eat Planner</h1>
        </router-link>
        <ModeToggle />
        <RoundedButton :disabled="isLoggingOut" @click="handleLogout">
          {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
        </RoundedButton>
      </div>
    </header>
    <nav
      class="p-4 flex gap-4 text-lg font-medium border-b border-base-color/10 md:hidden"
      aria-label="mobile"
    >
      <router-link
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="px-3 py-2 rounded-md transition-colors"
        :class="
          isActiveLink(link.to)
            ? 'bg-brand-primary/15 text-brand-primary'
            : 'text-base-color/70 hover:text-base-color'
        "
      >
        {{ link.label }}
      </router-link>
    </nav>

    <div class="flex flex-1 overflow-hidden">
      <aside
        class="hidden md:flex w-60 shrink-0 flex-col gap-2 border-r border-base-color/10 bg-surface-raised/60 p-6"
        aria-label="sidebar"
      >
        <h2 class="text-sm uppercase tracking-wide text-base-color/70">Navigation</h2>
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
      </aside>

      <main class="flex-1 overflow-y-auto p-6">
        <RouterView v-slot="{ Component, route }">
          <template v-if="Component">
            <component :is="Component" />
          </template>
        </RouterView>
      </main>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import RoundedButton from '@/components/ui/RoundedButton.vue';
import TheFooter from './TheFooter.vue';
import ModeToggle from '@/components/ui/ModeToggle.vue';

const navLinks = [
  { label: 'Weeks', to: '/weeks' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Profile', to: '/profile' },
];

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const activePath = computed(() => route.path);
const isLoggingOut = ref(false);

const isActiveLink = (path: string) => activePath.value.startsWith(path);

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
</script>

<style scoped></style>
