<template>
  <div class="flex h-full w-full items-center justify-center bg-brand-primary/20">
    <div class="text-center flex flex-row items-center justify-center gap-3 text-2xl">
      <Spinner class="size-6" />
      <p class="text-muted-foreground">Loading {{ loadingName }}...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Spinner from '@/components/ui/spinner/Spinner.vue';
const { loadingName = 'data' } = defineProps<{
  loadingName?: string;
}>();
</script>
