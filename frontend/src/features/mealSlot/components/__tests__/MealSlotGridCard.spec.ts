import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotGridCard from '../MealSlotGridCard.vue';
import type { MealSlot } from '@/api/weeks';
import i18n from '@/i18n';
import MealSlotEmptyCard from '../MealSlotEmptyCard.vue';
import MealSlotRecipeCard from '../MealSlotRecipeCard.vue';

describe('MealSlotGridCard', () => {
  const mountComponent = (mealSlot: MealSlot) =>
    mount(MealSlotGridCard, {
      props: { mealSlot },
      global: { plugins: [i18n] },
    });

  const defaultSlot: MealSlot = {
    id: 'meal-1',
    meal_type: 'SNACK',
    day_of_week: 'MONDAY',
    recipe: null,
  };

  it('renders MealSlotEmptyCard when no recipe is assigned', () => {
    const wrapper = mountComponent(defaultSlot);
    expect(wrapper.findComponent(MealSlotEmptyCard).exists()).toBe(true);
    expect(wrapper.findComponent(MealSlotRecipeCard).exists()).toBe(false);
  });

  it('renders MealSlotRecipeCard when a recipe is assigned', () => {
    const recipe = {
      id: 'recipe-1',
      name: 'Pasta',
      is_favorite: false,
      author: 'me',
      image_url: 'pic',
    };
    const wrapper = mountComponent({ ...defaultSlot, recipe });

    expect(wrapper.findComponent(MealSlotRecipeCard).exists()).toBe(true);
    expect(wrapper.findComponent(MealSlotEmptyCard).exists()).toBe(false);
  });
});
