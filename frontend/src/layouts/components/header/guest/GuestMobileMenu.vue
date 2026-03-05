<template>
  <Button variant="ghost" class="md:hidden" aria-controls="mobile-menu" @click="toggle">
    <Menu class="size-6" />
    <span class="sr-only">Toggle mobile menu</span>
  </Button>

  <Sheet v-model:open="open">
    <SheetContent side="top">
      <SheetHeader>
        <AppBrand />
      </SheetHeader>
      <GuestNavigation :links="props.links" />
      <SheetFooter>
        <GuestAuthActions />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Menu } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader } from '@/components/ui/sheet';

import GuestNavigation from './GuestNavigation.vue';
import GuestAuthActions from './GuestAuthActions.vue';
import AppBrand from '@/components/shared/AppBrand.vue';
import type { NavLink } from '../types/navigation';

const props = defineProps<{
  links: NavLink[];
}>();

const open = ref(false);
const toggle = () => (open.value = !open.value);
const close = () => (open.value = false);

const route = useRoute();
watch(
  () => route.fullPath,
  () => close(),
);
</script>
