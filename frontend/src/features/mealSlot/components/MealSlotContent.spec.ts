import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotContent from './MealSlotContent.vue';
import type { MealSlot, MealType } from '@/domain/week/models';

describe('MealSlotContent', () => {
  const mountComponent = (mealSlot: MealSlot) => {
    return mount(MealSlotContent, {
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

  it('renders the Plus icon', () => {
    const wrapper = mountComponent(defaultSlot);
    expect(wrapper.find('svg').exists()).toBe(true);
  });
});
