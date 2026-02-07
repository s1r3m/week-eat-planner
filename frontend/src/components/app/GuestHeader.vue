<template>
  <header
    class="h-16 sticky top-0 z-30 border-b bg-background/70 backdrop-blur flex items-center justify-between mx-2"
  >
    <router-link
      to="/#hero"
      class="flex items-center gap-2 text-foreground hover:text-foreground/80 px-2"
    >
      <img class="h-10 w-auto" src="@/assets//logo.png" alt="Week Eat Planner logo" />
      <h1 class="text-lg font-semibold tracking-tight text-brand-primary md:text-xl">
        Week Eat Planner
      </h1>
    </router-link>

    <NavigationMenu class="flex-1 hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem v-for="link in navLinks" :key="link.to">
          <NavigationMenuLink as-child :class="navigationMenuTriggerStyle()">
            <router-link :to="link.to"> {{ link.label }} </router-link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>

    <div id="auth-buttons" class="flex items-center gap-3">
      <ModeToggle />
      <Button v-if="showLogin" variant="outline" size="sm" as-child class="hidden md:inline-flex">
        <router-link to="/login">Login</router-link>
      </Button>
      <Button v-if="showSignup" size="sm" as-child class="hidden md:inline-flex">
        <router-link to="/signup">Sign Up</router-link>
      </Button>
      <Button
        v-if="isAuthenticated"
        variant="outline"
        size="sm"
        class="hidden md:inline-flex"
        @click="auth_store.logout"
      >
        Logout
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
        <Menu class="size-6" />
        <span class="sr-only">Toggle menu</span>
      </Button>
    </div>

    <Sheet v-model:open="isMobileMenuOpen">
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle> Week Eat Planner v0.0.1 </SheetTitle>
          <SheetDescription> Navigation Menu </SheetDescription>
        </SheetHeader>
        <div class="flex flex-col gap-3">
          <router-link to="/#hero" class="p-3 mx-3 font-medium transition-colors">
            Home
          </router-link>

          <div v-for="link in navLinks" :key="link.to" class="p-3 mx-3 font-medium">
            <router-link :to="link.to"> {{ link.label }} </router-link>
          </div>
        </div>
        <SheetFooter>
          <div class="flex flex-col gap-3 mt-9">
            <Button v-if="showLogin" variant="outline" size="sm" as-child>
              <router-link to="/login" @click="closeMobileMenu">Login</router-link>
            </Button>
            <Button v-if="showSignup" size="sm" as-child>
              <router-link to="/signup" @click="closeMobileMenu">Sign Up</router-link>
            </Button>
            <SheetClose as-child>
              <Button v-if="isAuthenticated" variant="outline" size="sm" @click="auth_store.logout">
                Logout
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Menu } from 'lucide-vue-next';
import ModeToggle from '@/components/shared/ModeToggle.vue';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/features/auth/store/auth';
import { storeToRefs } from 'pinia';

export interface NavLink {
  label: string;
  to: string;
}

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
const auth_store = useAuthStore();
const { isAuthenticated } = storeToRefs(auth_store);
const showLogin = computed(() => !isAuthenticated.value && route.path !== '/login');
const showSignup = computed(() => !isAuthenticated.value && route.path !== '/signup');

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
