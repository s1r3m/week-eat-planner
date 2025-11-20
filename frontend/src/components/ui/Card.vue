<template>
  <div :class="rootClasses" @click="interactive ? emit('click') : null">
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
    <figure :class="figureClasses">
      <img v-if="src" :src="src" :alt="name" :class="imageClasses" />
      <div v-else class="h-full w-full bg-surface-raised"></div>
      <div v-if="showOverlay" class="absolute inset-0" :class="overlayClass"></div>
      <div :class="contentClasses">
        <slot>
          <h2 :class="['text-3xl font-bold md:text-4xl', textClass]">
            {{ name }}
          </h2>
        </slot>
      </div>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

type Variant = 'default' | 'hero';

interface Props {
  interactive?: boolean;
  name?: string;
  src?: string;
  showOverlay?: boolean;
  variant?: Variant;
}

const props = withDefaults(defineProps<Props>(), {
  interactive: true,
  showOverlay: true,
  variant: 'default' as Variant,
});

const interactiveClasses = computed(() =>
  props.interactive ? 'cursor-pointer hover:shadow-xl transition-shadow duration-300' : '',
);

const rootClasses = computed(
  () =>
    `relative z-0 w-full overflow-hidden rounded-3xl shadow-lg ${interactiveClasses.value} ${
      props.variant === 'default' ? 'aspect-[3/2]' : ''
    }`,
);

const figureClasses = computed(() =>
  props.variant === 'default' ? 'relative block h-full w-full' : 'relative block w-full',
);

const imageClasses = computed(() =>
  props.variant === 'default'
    ? 'block h-full w-full object-cover'
    : 'block w-full h-auto object-cover',
);

const contentClasses = computed(
  () =>
    `absolute inset-0 z-10 flex items-end justify-center text-center ${
      props.variant === 'default' ? 'px-4 pb-4 md:pb-6' : 'px-4 pb-6 md:pb-8'
    }`,
);

const textClass = computed(() => 'text-white drop-shadow');

const overlayClass = computed(
  () => 'bg-gradient-to-t from-brand-primary/50 via-brand-primary/25 to-transparent',
);

const emit = defineEmits(['click', 'edit', 'delete']);
</script>

<style scoped></style>
