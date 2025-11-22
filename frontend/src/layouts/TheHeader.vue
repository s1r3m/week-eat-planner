<template>
  <header class="sticky inset-0 z-10 bg-surface-raised py-4">
    <section class="container-center flex items-center justify-between pr-2">
      <router-link to="/" class="flex items-center gap-3">
        <img class="max-w-14" src="@/assets//logo.png" alt="logo" />
        <h1 class="text-3xl font-medium">Week Eat Planner</h1>
      </router-link>

      <nav class="hidden md:block space-x-8 text-xl" aria-label="header">
        <router-link
          v-for="link in navLinks"
          :key="link.hash"
          :to="{ path: link.path ?? '/', hash: link.hash }"
          class="hover:opacity-65"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div>
        <button
          id="mobile-open-menu"
          class="text-3xl hover:opacity-65 md:hidden cursor-pointer relative w-8 h-8"
          type="button"
          aria-controls="mobile-menu"
          :aria-expanded="isMobileMenuOpen"
          @click="toggleMobileMenu"
        >
          &#9776;
        </button>
      </div>

      <div class="hidden md:block">
        <div class="flex justify-between gap-4">
          <router-link v-if="!isLogin" to="/login">
            <RoundedButton>Login</RoundedButton>
          </router-link>
          <router-link v-if="!isSignup" to="/signup">
            <RoundedButton variant="primary">Sign Up</RoundedButton>
          </router-link>
        </div>
      </div>
    </section>

    <section
      id="mobile-menu"
      class="absolute inset-0 bg-brand-muted min-h-screen text-5xl w-full flex-col justify-start transition-all duration-300"
      :class="isMobileMenuOpen ? 'flex' : 'hidden'"
      aria-label="mobile"
    >
      <button
        class="text-5xl self-end cursor-pointer pr-3 pt-5"
        type="button"
        @click="closeMobileMenu"
      >
        &times;
      </button>

      <nav class="flex flex-col items-center gap-12 py-12 justify-center">
        <router-link
          v-for="link in navLinks"
          :key="link.hash"
          :to="{ path: link.path ?? '/', hash: link.hash }"
          class="hover:opacity-65"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div class="flex flex-col justify-around items-center gap-4 py-12">
        <router-link v-if="!isLogin" to="/login" class="w-full px-4">
          <RoundedButton @click="closeMobileMenu" class="w-full">Login</RoundedButton>
        </router-link>
        <router-link v-if="!isSignup" to="/signup" class="w-full px-4">
          <RoundedButton variant="primary" @click="closeMobileMenu" class="w-full"
            >Sign Up</RoundedButton
          >
        </router-link>
      </div>
    </section>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import RoundedButton from '@/components/ui/RoundedButton.vue';

type NavLink = {
  hash: string;
  label: string;
  path?: string;
};

const defaultNavLinks: NavLink[] = [
  { hash: '#hero', label: 'Home' },
  { hash: '#use-cases', label: 'Use Cases' },
  { hash: '#get-started', label: 'Get Started' },
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
