import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotGrid from './MealSlotGrid.vue';
import i18n from '@/i18n';
import en from '@/i18n/locales/en';
import type { WeekDay } from '@/domain/week/models';
import MealSlotGridCard from './MealSlotGridCard.vue';

describe('MealSlotGrid', () => {
  const weekDays: WeekDay[] = [
    {
      name: 'MONDAY',
      slots: [
        {
          id: 'slot-1',
          meal_type: 'BREAKFAST',
          day_of_week: 'MONDAY',
          recipe: null,
        },
      ],
    },
    {
      name: 'TUESDAY',
      slots: [
        {
          id: 'slot-2',
          meal_type: 'LUNCH',
          day_of_week: 'TUESDAY',
          recipe: { id: 'recipe-1', name: 'Pasta' },
        },
      ],
    },
  ];

  it('renders all provided week days', () => {
    const wrapper = mount(MealSlotGrid, {
      props: { weekDays },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.text()).toContain(en.daysOfWeek.MONDAY);
    expect(wrapper.text()).toContain(en.daysOfWeek.TUESDAY);
  });

  it('renders MealSlotGridCard for each slot', () => {
    const wrapper = mount(MealSlotGrid, {
      props: { weekDays },
      global: {
        plugins: [i18n],
      },
    });

    const cards = wrapper.findAllComponents(MealSlotGridCard);
    expect(cards).toHaveLength(2);
  });
});
