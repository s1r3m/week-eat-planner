<template>
  <header class="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
      <router-link to="/" class="flex items-center gap-2 text-foreground hover:text-foreground/80">
        <img class="h-10 w-auto" src="@/assets//logo.png" alt="Week Eat Planner logo" />
        <span class="text-lg font-semibold tracking-tight text-brand-primary md:text-xl"
          >Week Eat Planner</span
        >
      </router-link>

      <nav class="ml-6 hidden items-center gap-6 text-sm font-medium md:flex" aria-label="header">
        <router-link
          v-for="link in navLinks"
          :key="link.hash"
          :to="{ path: link.path ?? '/', hash: link.hash }"
          class="text-muted-foreground transition hover:text-foreground"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <ModeToggle />
        <Button v-if="!isLogin" variant="ghost" size="sm" as-child class="hidden md:inline-flex">
          <router-link to="/login">Login</router-link>
        </Button>
        <Button v-if="!isSignup" size="sm" as-child class="hidden md:inline-flex">
          <router-link to="/signup">Sign Up</router-link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden"
          type="button"
          aria-controls="mobile-menu"
          :aria-expanded="isMobileMenuOpen"
          @click="toggleMobileMenu"
        >
          <Icon v-if="!isMobileMenuOpen" icon="radix-icons:hamburger-menu" class="h-5 w-5" />
          <Icon v-else icon="radix-icons:cross-2" class="h-5 w-5" />
          <span class="sr-only">Toggle menu</span>
        </Button>
      </div>
    </div>

    <section
      v-if="isMobileMenuOpen"
      id="mobile-menu"
      class="absolute inset-x-0 top-full z-40 md:hidden"
      aria-label="mobile"
    >
      <div class="border-t bg-background/95 backdrop-blur">
        <nav class="flex flex-col gap-2 px-4 py-3 text-base font-medium">
          <router-link
            v-for="link in navLinks"
            :key="link.hash"
            :to="{ path: link.path ?? '/', hash: link.hash }"
            class="rounded-md px-3 py-2 text-foreground transition hover:bg-muted"
            @click="closeMobileMenu"
          >
            {{ link.label }}
          </router-link>
        </nav>
        <div class="flex items-center gap-2 px-4 pb-4">
          <Button v-if="!isLogin" variant="ghost" class="flex-1" as-child @click="closeMobileMenu">
            <router-link to="/login">Login</router-link>
          </Button>
          <Button v-if="!isSignup" class="flex-1" as-child @click="closeMobileMenu">
            <router-link to="/signup">Sign Up</router-link>
          </Button>
        </div>
      </div>
    </section>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';

import ModeToggle from '@/components/shared/ModeToggle.vue';
import { Button } from '@/components/ui/button';

type NavLink = {
  hash: string;
  label: string;
  path?: string;
};

const defaultNavLinks: NavLink[] = [
  { hash: '#hero', label: 'Home' },
  { hash: '#use-cases', label: 'Use Cases' },
  { hash: '#get-started', label: 'Get Started' },
  { hash: '#weeks', label: 'Start Planning', path: '/weeks' },
];

const props = defineProps<{
  navLinks?: NavLink[];
}>();

const navLinks = computed(() => props.navLinks ?? defaultNavLinks);

const isMobileMenuOpen = ref(false);
const route = useRoute();

const isLogin = computed(() => route.path === '/login');
const isSignup = computed(() => route.path === '/signup');
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu();
  },
);
</script>

<style scoped></style>
