<template>
  <div class="content">
    <img :src="default_img" alt="Week Image" class="background" />
    <div class="gradient-layout"></div>
    <router-link :to="`/weeks/${props.week.id}`" class="absolute inset-0 z-20"></router-link>
    <h3>
      {{ week.name }}
    </h3>
    <div class="controls">
      <RoundedButton class="btn-circle" @click.stop="$emit('edit')">
        <Icon icon="mdi:pencil" class="icon" />
      </RoundedButton>
      <RoundedButton class="btn-circle" @click.stop="$emit('delete')">
        <Icon icon="mdi:trash-can-outline" class="icon" />
      </RoundedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import RoundedButton from '@/components/ui/RoundedButton.vue';
import { Icon } from '@iconify/vue';
import type { UserWeek } from '@/types/api';

const props = defineProps<{ week: UserWeek }>();
defineEmits<{ edit: []; delete: [] }>();

const default_img = new URL('@/assets/week_bg.svg', import.meta.url).href;
</script>

<style scoped>
@import '@/theme.css';
@import 'tailwindcss';

.content {
  @apply relative rounded-2xl overflow-hidden;

  .background {
    @apply w-full h-full object-cover object-center z-0;
  }

  .gradient-layout {
    @apply absolute inset-0 z-10 bg-linear-to-t from-brand-primary/50 via-brand-primary/10 to-transparent;
  }

  .controls {
    @apply absolute top-2 right-2 flex gap-2 z-40 pointer-events-auto;
  }

  h3 {
    @apply absolute bottom-2 w-full text-center text-2xl font-semibold z-30 pointer-events-none;
  }
}

.btn-circle {
  @apply p-2 rounded-full active:ring-1 bg-white/80 backdrop-blur;
}

.icon {
  @apply size-6 cursor-pointer;
}
</style>
