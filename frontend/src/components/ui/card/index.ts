export { default as Card } from './Card.vue';
export { default as CardAction } from './CardAction.vue';
export { default as CardContent } from './CardContent.vue';
export { default as CardDescription } from './CardDescription.vue';
export { default as CardFooter } from './CardFooter.vue';
export { default as CardHeader } from './CardHeader.vue';
export { default as CardTitle } from './CardTitle.vue';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export const cardVariants = cva('', {
  variants: {
    variant: {
      default:
        'bg-surface-container-low text-on-surface flex flex-col gap-6 rounded-xl border border-outline-variant py-6',
      slotEmpty:
        'flex flex-col text-center items-center justify-center border border-dashed border-primary rounded-xl hover:border-primary hover:bg-primary/8 transition-colors cursor-pointer h-30',
      slot: 'flex flex-col items-center justify-center border border-primary rounded-xl h-30 hover:border-3 group relative overflow-hidden',
      week: 'group relative overflow-hidden border-0 rounded-xl transition-all duration-300 hover:bg-surface-container-highest hover:scale-[1.02]',
      empty:
        'border-4 border-dashed border-primary rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary/8 transition',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type CardVariants = VariantProps<typeof cardVariants>;
