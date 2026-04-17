import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeSelectCard from '../RecipeSelectCard.vue';
import type { RecipePreview } from '@/api/recipes';

const mockRecipe: RecipePreview = {
  id: '1',
  name: 'Test Recipe',
  author: 'Test Author',
  is_favorite: false,
  image_url: 'http://example.com/image.jpg',
};

describe('RecipeSelectCard', () => {
  it('renders recipe name', () => {
    const wrapper = mount(RecipeSelectCard, {
      props: {
        recipe: mockRecipe,
      },
    });
    expect(wrapper.text()).toContain('Test Recipe');
  });

  it('renders image with correct attributes', () => {
    const wrapper = mount(RecipeSelectCard, {
      props: {
        recipe: mockRecipe,
      },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe(mockRecipe.image_url);
    expect(img.attributes('loading')).toBe('lazy');
  });

  it('applies selected classes when isSelected is true', () => {
    const wrapper = mount(RecipeSelectCard, {
      props: {
        recipe: mockRecipe,
        isSelected: true,
      },
    });
    expect(wrapper.classes()).toContain('border-primary');
  });

  it('emits select event on click', async () => {
    const wrapper = mount(RecipeSelectCard, {
      props: {
        recipe: mockRecipe,
      },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([mockRecipe]);
  });
});
