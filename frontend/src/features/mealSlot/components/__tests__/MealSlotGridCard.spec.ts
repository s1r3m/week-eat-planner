import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotCard from '../MealSlotGridCard.vue';
import type { MealSlot, MealType } from '@/domain/week/models';
import i18n from '@/i18n';
import en from '@/i18n/locales/en';

describe('MealSlotCard', () => {
  const mountComponent = (mealSlot: MealSlot) => {
    return mount(MealSlotCard, {
      props: {
        mealSlot,
      },
      global: {
        plugins: [i18n],
      },
    });
  };

  const defaultSlot: MealSlot = {
    id: 'meal-1',
    meal_type: 'SNACK',
    day_of_week: 'MONDAY',
    recipe: null,
  };

  it('renders the meal_slot type', () => {
    const wrapper = mountComponent(defaultSlot);

    expect(wrapper.text()).toContain(en.mealTypes[defaultSlot.meal_type]);
  });

  it('renders the assign recipe message when no recipe is assigned', () => {
    const wrapper = mountComponent(defaultSlot);

    expect(wrapper.text()).toContain(en.mealSlotCard.assignRecipe);
  });

  it.each(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as MealType[])(
    'renders correctly for meal type: %s',
    (mealType) => {
      const wrapper = mountComponent({ ...defaultSlot, meal_type: mealType });
      expect(wrapper.text()).toContain(en.mealTypes[mealType]);
    },
  );

  it('renders the recipe name when a recipe is assigned', () => {
    const recipe = { id: 'recipe-1', name: 'Pasta' };
    const wrapper = mountComponent({ ...defaultSlot, recipe });

    expect(wrapper.text()).toContain('Pasta');
    expect(wrapper.text()).not.toContain(en.mealSlotCard.assignRecipe);
  });
});
