import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('p-4', 'm-2')).toBe('p-4 m-2');
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4');
  });

  it('should handle conditional classes', () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn('p-4', true && 'm-2', false && 'bg-red-500')).toBe('p-4 m-2');
  });

  it('should handle undefined and null', () => {
    expect(cn('p-4', undefined, null)).toBe('p-4');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['p-4', 'm-2'])).toBe('p-4 m-2');
  });
});
