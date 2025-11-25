<template>
  <div class="card-container hovered">
    <img :src="bgImage[props.variant]" alt="Week Image" @click="$emit('create-week')" />
    <div v-if="variant === 'showWeek'" class="gradient-layout" @click="$emit('click')"></div>
    <div v-if="variant === 'showWeek'" class="controls">
      <RoundedButton @click.stop="$emit('edit')"
        ><Icon icon="mdi:pencil" class="w-6 h-6 cursor-pointer"
      /></RoundedButton>
      <RoundedButton @click.stop="$emit('delete')"
        ><Icon icon="mdi:trash-can-outline" class="w-6 h-6 cursor-pointer"
      /></RoundedButton>
    </div>
    <h3 v-if="variant === 'showWeek'" class="text-2xl font-semibold text-center mb-2">
      {{ name }}
    </h3>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import RoundedButton from '@/components/ui/RoundedButton.vue';
import { Icon } from '@iconify/vue';

const variants = ['showWeek', 'addWeek'] as const;
type Variant = (typeof variants)[number];

interface Props {
  name?: string;
  src?: string;
  variant?: Variant;
}
const props = withDefaults(defineProps<Props>(), { name: '', variant: 'showWeek' });

defineEmits<{
  click: [];
  edit: [];
  delete: [];
  'create-week': [];
}>();

const defaultWeekBg = new URL('@/assets/week_bg.svg', import.meta.url).href;
const weekImage = computed(() => props.src || defaultWeekBg);
const bgImage = {
  showWeek: new URL(weekImage.value, import.meta.url).href,
  addWeek: new URL('@/assets/add_week_bg_1.png', import.meta.url).href,
};
</script>

<style scoped>
@import '@/theme.css';
@import 'tailwindcss';

.card-container {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  @apply rounded-2xl shadow-lg;

  h3,
  img,
  .controls,
  .gradient-layout,
  form {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  h3 {
    align-self: end;
  }

  img {
    object-fit: cover;
    object-position: center;
    aspect-ratio: 4 / 3;
    max-height: 100%;
    align-self: center;
    justify-self: center;
    border-radius: 1rem;
  }

  .controls {
    place-self: start end;
  }

  button {
    @apply rounded-full active:ring-1 p-2 m-2;
  }

  .gradient-layout {
    @apply rounded-2xl bg-linear-to-t from-brand-primary/50 via-brand-primary/10
    to-transparent w-full h-full cursor-pointer;
  }
}
.hovered {
  @apply hover:shadow-xl hover:border hover:border-brand-primary transition-shadow duration-300;
}
</style>
