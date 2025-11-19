<template>
  <div
    class="relative w-full overflow-hidden rounded-3xl shadow-lg aspect-3/2"
    :class="{ 'cursor-pointer hover:shadow-xl transition-shadow duration-300': interactive }"
    @click="interactive ? emit('click') : null"
  >
    <div v-if="interactive" class="absolute top-3 right-3 z-20 flex gap-2">
      <button
        class="p-2 bg-white/70 rounded-full active:ring-1 active:border-brand-primary hover:bg-brand-muted"
        @click.stop="emit('edit')"
      >
        <Icon icon="mdi:pencil" class="w-6 h-6 cursor-pointer" />
      </button>
      <button
        class="p-2 bg-white/70 rounded-full active:ring-1 active:border-brand-primary hover:bg-brand-muted"
        @click.stop="emit('delete')"
      >
        <Icon icon="mdi:trash-can-outline" class="w-6 h-6 cursor-pointer" />
      </button>
    </div>
    <div class="absolute inset-0">
      <img v-if="src" :src="src" :alt="name" class="h-full w-full object-cover" />
      <div v-else class="h-full w-full bg-surface-raised"></div>
    </div>
    <div
      v-if="showOverlay"
      class="absolute inset-0 bg-linear-to-t from-brand-primary/30 to-transparent"
    ></div>
    <div class="relative z-10 flex h-full w-full items-center justify-center px-4 py-6 text-center">
      <slot>
        <h2 class="text-3xl font-bold text-white drop-shadow md:text-4xl">
          {{ name }}
        </h2>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface Props {
  interactive?: boolean;
  name?: string;
  src?: string;
  showOverlay?: boolean;
}

withDefaults(defineProps<Props>(), {
  interactive: true,
  showOverlay: true,
});

const emit = defineEmits(['click', 'edit', 'delete']);
</script>

<style scoped></style>
