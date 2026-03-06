import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotCard from './MealSlotCard.vue';
import type { MealSlot, MealType } from '@/domain/week/models';

describe('MealSlotCard', () => {
  const mountComponent = (mealSlot: MealSlot) => {
    return mount(MealSlotCard, {
      props: {
        mealSlot,
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

    expect(wrapper.text()).toContain(defaultSlot.meal_type);
  });

  it('renders the assign recipe message when no recipe is assigned', () => {
    const wrapper = mountComponent(defaultSlot);

    expect(wrapper.text()).toContain('Assign a recipe');
  });

  it.each(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as MealType[])(
    'renders correctly for meal type: %s',
    (mealType) => {
      const wrapper = mountComponent({ ...defaultSlot, meal_type: mealType });
      expect(wrapper.text()).toContain(mealType);
    },
  );

  it('renders the recipe name when a recipe is assigned', () => {
    const recipe = { id: 'recipe-1', name: 'Pasta' };
    const wrapper = mountComponent({ ...defaultSlot, recipe });

    expect(wrapper.text()).toContain('Pasta');
    expect(wrapper.text()).not.toContain('Assign a recipe');
  });

  it('renders with slot variant', () => {
    const wrapper = mountComponent(defaultSlot);
    expect(wrapper.attributes('class')).toContain('min-h-20');
  });
});
