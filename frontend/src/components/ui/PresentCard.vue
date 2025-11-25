<template>
  <div class="grid-item mx-auto">
    <img :src="bgImage[props.variant]" alt="Week Image" class="" />
    <div v-if="variant === 'showWeek'" class="gradient-layout" @click.stop="$emit('click')"></div>
    <div v-if="variant === 'showWeek'" class="controls">
      <RoundedButton @click="$emit('edit')"
        ><Icon icon="mdi:pencil" class="w-6 h-6 cursor-pointer"
      /></RoundedButton>
      <RoundedButton @click="$emit('delete')"
        ><Icon icon="mdi:trash-can-outline" class="w-6 h-6 cursor-pointer"
      /></RoundedButton>
    </div>
    <h3 v-if="variant === 'showWeek'" class="text-2xl font-semibold text-center mb-2">
      {{ name }}
    </h3>
    <form @submit.prevent="onCreateWeek">
      <input
        v-if="variant === 'addWeek'"
        v-model="newWeekName"
        class="text-2xl"
        type="text"
        placeholder="week name"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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

const emit = defineEmits<{
  click: [];
  edit: [];
  delete: [];
  createWeek: [weekName: string];
}>();

const defaultWeekBg = new URL('@/assets/week_bg.svg', import.meta.url).href;
const weekImage = computed(() => props.src || defaultWeekBg);
const bgImage = {
  showWeek: new URL(weekImage.value, import.meta.url).href,
  addWeek: new URL('@/assets/plus.png', import.meta.url).href,
};

// Create a new week.
const newWeekName = ref('');
const onCreateWeek = () => {
  if (!newWeekName.value) {
    return;
  }
  emit('createWeek', newWeekName.value);
  newWeekName.value = '';
};
</script>

<style scoped>
@import '../../theme.css';
@import 'tailwindcss';

.grid-item {
  display: grid;
  place-items: end;
  @apply rounded-2xl shadow-lg hover:shadow-xl hover:border hover:-m-px  hover:border-brand-primary transition-shadow duration-300;

  h3,
  img,
  .controls,
  .gradient-layout {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  h3 {
    width: 100%;
  }

  img {
    object-fit: scale-down;
    object-position: center;
    width: 100%;
    height: 100%;
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
</style>
