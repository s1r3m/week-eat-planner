import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeCover from './RecipeCover.vue';

describe('RecipeCover', () => {
  it('renders with src', () => {
    const wrapper = mount(RecipeCover, {
      props: {
        src: 'test-src.jpg',
        alt: 'test-alt',
      },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('test-src.jpg');
    expect(img.attributes('alt')).toBe('test-alt');
  });

  it('renders with default img when src is not provided', () => {
    const wrapper = mount(RecipeCover, {
      props: {
        alt: 'test-alt',
      },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toContain('recipe_bg.png');
    expect(img.attributes('alt')).toBe('test-alt');
  });
});
