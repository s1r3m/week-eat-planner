<template>
  <AppHeader>
    <template #left>
      <AppBrand />
    </template>

    <template #center>
      <GuestNavigation :links="navLinks" class="hidden md:flex" />
    </template>

    <template #right>
      <div class="flex gap-3">
        <ModeToggle />
        <GuestAuthActions class="hidden md:flex" />
        <GuestMobileMenu :links="navLinks" />
      </div>
    </template>
  </AppHeader>
</template>

<script setup lang="ts">
import AppBrand from '@/components/shared/AppBrand.vue';
import ModeToggle from '@/components/shared/ModeToggle.vue';

import GuestNavigation from './GuestNavigation.vue';
import GuestAuthActions from './GuestAuthActions.vue';
import GuestMobileMenu from './GuestMobileMenu.vue';
import AppHeader from '../AppHeader.vue';
import type { NavLink } from '../types/navigation';

const navLinks: NavLink[] = [
  { to: '#use-cases', label: 'Use Cases' },
  { to: '#get-started', label: 'Get Started' },
  { to: '/weeks', label: 'Start Planning' },
];
</script>
