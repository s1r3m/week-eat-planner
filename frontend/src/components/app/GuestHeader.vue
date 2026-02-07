<template>
  <header
    class="h-16 sticky top-0 z-30 border-b bg-background/70 backdrop-blur flex items-center justify-between mx-2"
  >
    <AppBrand />
    <AppNavigation :links="navLinks" class="hidden md:flex" />
    <ModeToggle />
    <AppAuthActions class="hidden md:flex gap-3" />
    <Button
      variant="ghost"
      size="icon"
      class="md:hidden"
      type="button"
      aria-controls="mobile-menu"
      @click="toggleMobileMenu"
    >
      <Menu class="size-6" />
      <span class="sr-only">Toggle menu</span>
    </Button>

    <Sheet v-model:open="isMobileMenuOpen">
      <SheetContent side="top">
        <SheetHeader>
          <AppBrand />
        </SheetHeader>
        <AppNavigation :links="navLinks" />
        <SheetFooter>
          <AppAuthActions />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { AppAuthActions, AppBrand, AppNavigation, type NavLink } from '@/components/header';
import { Menu } from 'lucide-vue-next';
import ModeToggle from '@/components/shared/ModeToggle.vue';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader } from '@/components/ui/sheet';

const defaultNavLinks: NavLink[] = [
  { to: '/#use-cases', label: 'Use Cases' },
  { to: '/#get-started', label: 'Get Started' },
  { to: '/weeks', label: 'Start Planning' },
];

const props = defineProps<{
  navLinks?: NavLink[];
}>();

const navLinks = computed(() => props.navLinks ?? defaultNavLinks);

const isMobileMenuOpen = ref(false);
const route = useRoute();

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
