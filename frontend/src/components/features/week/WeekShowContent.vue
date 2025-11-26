<template>
  <div class="stack-container">
    <img :src="default_img" alt="Week Image" />
    <div class="gradient-layout" @click.stop="$emit('click')"></div>
    <div class="controls">
      <RoundedButton class="btn-circle" @click.stop="$emit('edit')">
        <Icon icon="mdi:pencil" class="icon" />
      </RoundedButton>
      <RoundedButton class="btn-circle" @click.stop="$emit('delete')">
        <Icon icon="mdi:trash-can-outline" class="icon" />
      </RoundedButton>
    </div>
    <h3>{{ week.name }}</h3>
  </div>
</template>

<script setup lang="ts">
import RoundedButton from '@/components/ui/RoundedButton.vue';
import { Icon } from '@iconify/vue';
import type { UserWeek } from '@/types/api';

defineProps<{ week: UserWeek }>();
defineEmits<{
  click: [];
  edit: [];
  delete: [];
}>();

const default_img = new URL('@/assets/week_bg.svg', import.meta.url).href;
</script>

<style scoped>
@import '@/theme.css';
@import 'tailwindcss';

.stack-container {
  @apply grid;

  img,
  h3,
  .gradient-layout,
  .controls {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  img {
    @apply overflow-hidden object-cover object-center aspect-4/3
    max-h-full self-center justify-self-center;
  }

  h3 {
    @apply self-end text-2xl font-semibold text-center mb-2;
  }

  .controls {
    place-self: start end;
  }

  .gradient-layout {
    @apply rounded-2xl bg-linear-to-t from-brand-primary/50 via-brand-primary/10
    to-transparent w-full h-full cursor-pointer;
  }
}

.btn-circle {
  @apply p-2 m-2 rounded-full active:ring-1;

  .icon {
    @apply w-6 h-6 cursor-pointer;
  }
}
</style>
