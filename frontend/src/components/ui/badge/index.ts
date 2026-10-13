import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Badge } from './Badge.vue';

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-label-sm font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 aria-invalid:border-error transition-all overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-on-primary',
        secondary: 'border-transparent bg-secondary-container text-on-secondary-container',
        destructive: 'border-transparent bg-error text-on-error',
        outline: 'border-outline text-on-surface-variant',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;
