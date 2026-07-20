import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ShoppingListLine from '../ShoppingListLine.vue';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import IngredientItem from '@/components/shared/IngredientItem.vue';

describe('ShoppingListLine', () => {
  const mockItem = {
    name: 'Apples',
    amount: 5,
    unit: 'pcs' as const,
    checked: false,
  };

  it('renders the ingredient name and amount', () => {
    const wrapper = mount(ShoppingListLine, {
      props: {
        item: mockItem,
      },
      global: {
        stubs: {
          Checkbox: true,
          IngredientItem: {
            template: '<div><slot name="amount" /><span>{{ name }}</span></div>',
            props: ['name', 'amount', 'unit'],
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Apples');
    expect(wrapper.text()).toContain('5 pcs');
  });

  it('applies unchecked classes when checked is false', () => {
    const wrapper = mount(ShoppingListLine, {
      props: {
        item: mockItem,
      },
    });

    const label = wrapper.find('label');
    expect(label.classes()).not.toContain('opacity-50');

    const ingredientItem = wrapper.findComponent(IngredientItem);
    expect(ingredientItem.classes()).not.toContain('line-through');
  });

  it('applies checked classes when checked is true', () => {
    const wrapper = mount(ShoppingListLine, {
      props: {
        item: { ...mockItem, checked: true },
      },
    });

    const label = wrapper.find('label');
    expect(label.classes()).toContain('opacity-50');

    const ingredientItem = wrapper.findComponent(IngredientItem);
    expect(ingredientItem.classes()).toContain('line-through');
    expect(ingredientItem.classes()).toContain('text-primary');
  });

  it('emits update when checkbox value changes', async () => {
    const wrapper = mount(ShoppingListLine, {
      props: {
        item: mockItem,
      },
    });

    const checkbox = wrapper.findComponent(Checkbox);
    await checkbox.vm.$emit('update:modelValue', true);

    expect(wrapper.emitted('update')).toBeTruthy();
    expect(wrapper.emitted('update')![0]).toEqual([true]);

    await checkbox.vm.$emit('update:modelValue', false);
    expect(wrapper.emitted('update')![1]).toEqual([false]);
  });
});
