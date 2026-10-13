import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeCover from '../RecipeCover.vue';

describe('RecipeCover', () => {
  it('renders image with the provided src and alt', () => {
    const wrapper = mount(RecipeCover, {
      props: { src: 'test-src.jpg', alt: 'test-alt' },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('test-src.jpg');
    expect(img.attributes('alt')).toBe('test-alt');
  });

  it('falls back to the default image when src is not provided', () => {
    const wrapper = mount(RecipeCover, {
      props: { alt: 'test-alt' },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toContain('recipe_bg.png');
    expect(img.attributes('alt')).toBe('test-alt');
  });
});
