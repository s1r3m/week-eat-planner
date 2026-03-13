<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { CardVariants } from '.';
import { cn } from '@/lib/utils';
import { cardVariants } from '.';

interface Props {
  variant?: CardVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <div
    data-slot="card"
    class="min-w-24"
    :class="cn(cardVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </div>
</template>
