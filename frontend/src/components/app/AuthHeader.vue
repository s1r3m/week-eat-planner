<template>
  <header
    class="sticky top-0 z-60 h-13 bg-background/80 backdrop-blur flex transition-[width,height] ease-linear border-b"
  >
    <div class="flex flex-1 items-center">
      <div class="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger class="-ml-1 size-10" />
        <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
        <TheBreadcrumbs />
      </div>
      <ModeToggle />
    </div>
  </header>
</template>

<script setup lang="ts">
import ModeToggle from '@/components/shared/ModeToggle.vue';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Separator from '@/components/ui/separator/Separator.vue';
import TheBreadcrumbs from '@/components/app/breadcrumbs/TheBreadcrumbs.vue';
</script>
