<template>
  <header class="sticky inset-0 z-10 bg-surface-raised py-4">
    <section class="container-center flex items-center justify-between pr-2">
      <router-link to="/" class="flex items-center gap-3">
        <img class="max-w-14" src="@/assets//logo.png" alt="logo" />
        <h1 class="text-3xl font-mediumß">Week Eat Planner</h1>
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
        >
          &#9776;
        </button>
      </div>

      <div class="hidden md:block">
        <div class="flex justify-between gap-4">
          <router-link to="/login">
            <button class="btn">Login</button>
          </router-link>
          <router-link to="/signup">
            <button class="btn btn-primary">Sign Up</button>
          </router-link>
        </div>
      </div>
    </section>

    <section
      id="mobile-menu"
      class="hidden absolute inset-0 bg-brand-muted min-h-screen text-5xl w-full flex-col justify-start"
    >
      <button class="text-5xl self-end cursor-pointer pr-3 pt-5">&times;</button>

      <nav class="flex flex-col items-center gap-12 py-12 justify-center" aria-label="mobile">
        <router-link
          v-for="link in navLinks"
          :key="link.hash"
          :to="{ path: link.path ?? '/', hash: link.hash }"
          class="hover:opacity-65"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div class="flex flex-row justify-around items-center gap-4 py-12">
        <router-link to="/login">
          <button class="btn">Login</button>
        </router-link>
        <router-link to="/signup">
          <button class="btn btn-primary">Sign Up</button>
        </router-link>
      </div>
    </section>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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

const initMobileMenu = () => {
  const hamburgerBtn = document.getElementById('mobile-open-menu');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!hamburgerBtn || !mobileMenu) {
    return;
  }

  const toggleMenu = () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
  };

  hamburgerBtn.addEventListener('click', toggleMenu);
  mobileMenu.addEventListener('click', toggleMenu);
};

document.addEventListener('DOMContentLoaded', initMobileMenu);
</script>

<style scoped>
/* Scoped styles can be added here if needed, but the core layouts is now handled by Tailwind classes. */
</style>
