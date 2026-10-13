import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotRecipeCard from '../MealSlotRecipeCard.vue';
import i18n from '@/i18n';
import en from '@/i18n/locales/en';
import type { RecipePreview } from '@/api/recipes';

describe('MealSlotRecipeCard', () => {
  const mockRecipe: RecipePreview = {
    id: '1',
    name: 'Delicious Pasta',
    author: 'Chef',
    is_favorite: false,
    image_url: 'http://example.com/pasta.jpg',
  };

  const mountComponent = (mealType: string = 'LUNCH', recipe: RecipePreview = mockRecipe) =>
    mount(MealSlotRecipeCard, {
      props: { mealType, recipe },
      global: { plugins: [i18n] },
    });

  it('renders the meal type label', () => {
    const wrapper = mountComponent('DINNER');
    expect(wrapper.text()).toContain(en.mealTypes.DINNER);
  });

  it('renders the recipe name', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Delicious Pasta');
  });

  it('renders recipe image with correct attributes', () => {
    const wrapper = mountComponent();
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe(mockRecipe.image_url);
    expect(img.attributes('alt')).toBe(mockRecipe.name);
  });

  it('uses default image when recipe has no image_url', () => {
    const recipeNoImg = { ...mockRecipe, image_url: null };
    const wrapper = mountComponent('LUNCH', recipeNoImg);
    const img = wrapper.find('img');
    expect(img.attributes('src')).toContain('recipe_bg.png');
  });
});
