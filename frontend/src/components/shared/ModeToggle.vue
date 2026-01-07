<script setup lang="ts">
import { computed } from 'vue';
import { useColorMode } from '@vueuse/core';
import { MoonIcon, Sun, SunIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Keep transitions when switching themes and scope the class to <html>
const mode = useColorMode({
  selector: 'html',
  attribute: 'class',
  initialValue: 'auto',
  storageKey: 'week-eat-theme',
  disableTransition: false,
});

const menuValue = computed({
  get: () => mode.store.value,
  set: (v) => {
    mode.store.value = v;
  },
});
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost">
        <MoonIcon class="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <SunIcon
          class="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup v-model="menuValue">
        <DropdownMenuRadioItem value="light"> Light </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark"> Dark </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="auto"> System </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
