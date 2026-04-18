<script setup lang="ts">
import { computed } from 'vue';
import { useColorMode } from '@vueuse/core';
import { ContrastIcon, MoonIcon, SunIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mode = useColorMode({
  selector: 'html',
  attribute: 'class',
  initialValue: 'auto',
  storageKey: 'week-eat-planner.theme',
  disableTransition: false,
});

const menuValue = computed({
  get: () => mode.store.value,
  set: (v) => {
    mode.store.value = v;
  },
});

defineExpose({
  menuValue,
});
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button id="color-mode-toggle" variant="ghost" size="icon">
        <MoonIcon class="size-6 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <SunIcon
          class="absolute size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup v-model="menuValue">
        <DropdownMenuRadioItem value="light"> <SunIcon /> Light </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark"> <MoonIcon /> Dark </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="auto"> <ContrastIcon /> System </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
