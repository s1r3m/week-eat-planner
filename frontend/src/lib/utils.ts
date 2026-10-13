import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind CSS classes with `clsx` and `tailwind-merge`.
 * Handles conditional classes and ensures correct Tailwind class precedence.
 *
 * @param inputs - Variadic list of class values to merge.
 * @returns A merged string of Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
