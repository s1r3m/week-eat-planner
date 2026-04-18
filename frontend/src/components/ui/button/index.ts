import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-label-lg font-medium transition-all duration-medium2 ease-emphasized disabled:pointer-events-none disabled:opacity-38 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 aria-invalid:border-error hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary hover:bg-primary/92 active:bg-primary/88',
        destructive: 'bg-error text-on-error hover:bg-error/92 active:bg-error/88',
        outline: 'border border-outline text-primary hover:bg-primary/8 active:bg-primary/12',
        destructiveOutline: 'border border-error text-error hover:bg-error/8 active:bg-error/12',
        secondary:
          'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/92 active:bg-secondary-container/88',
        ghost: 'text-primary hover:bg-primary/8 active:bg-primary/12',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-5',
        sm: 'h-8 px-3 text-label-md',
        lg: 'h-11 px-7 text-title-sm',
        icon: 'size-10 rounded-full',
        'icon-sm': 'size-8 rounded-full',
        'icon-lg': 'size-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;
