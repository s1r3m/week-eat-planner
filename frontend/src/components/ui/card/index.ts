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
      default: 'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
      slot: 'flex flex-col text-center items-center justify-center border border-dashed border-primary rounded-xl hover:border-primary hover:bg-accent/30 transition-colors cursor-pointer min-h-20',
      week: 'group relative overflow-hidden border-0 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
      empty:
        'border-4 border-dashed rounded-xl border-primary rounded-xl flex items-center justify-center cursor-pointer hover:bg-accent/50 transition',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type CardVariants = VariantProps<typeof cardVariants>;
