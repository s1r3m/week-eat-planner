import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MealSlotEmptyCard from '../MealSlotEmptyCard.vue';
import i18n from '@/i18n';
import en from '@/i18n/locales/en';

describe('MealSlotEmptyCard', () => {
  const mountComponent = (mealType: string = 'LUNCH') => {
    return mount(MealSlotEmptyCard, {
      props: {
        mealType,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Card: { template: '<div v-bind="$attrs"><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
          Badge: { template: '<span><slot /></span>' },
          PlusCircle: { template: '<div class="plus-icon" />' },
        },
      },
    });
  };

  it('renders the meal type label', () => {
    const wrapper = mountComponent('BREAKFAST');
    expect(wrapper.text()).toContain(en.mealTypes.BREAKFAST);
  });

  it('renders the assign recipe message', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain(en.mealSlotCard.assignRecipe);
  });
});
