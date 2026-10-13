import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ShoppingList from '../ShoppingList.vue';
import ShoppingListLine from '../ShoppingListLine.vue';

describe('ShoppingList', () => {
  const mockList = [
    { name: 'Bananas', amount: 2, unit: 'g' as const, checked: false },
    { name: 'Apples', amount: 5, unit: 'pcs' as const, checked: false },
    { name: 'Carrots', amount: 3, unit: 'pcs' as const, checked: true },
  ];

  it('renders a list of shopping items sorted by name', () => {
    const wrapper = mount(ShoppingList, {
      props: {
        list: mockList,
      },
    });

    const lines = wrapper.findAllComponents(ShoppingListLine);
    expect(lines).toHaveLength(3);

    // Check sorting: Apples, Bananas, Carrots
    expect(lines[0].props('item').name).toBe('Apples');
    expect(lines[1].props('item').name).toBe('Bananas');
    expect(lines[2].props('item').name).toBe('Carrots');
  });

  it('handles empty list prop', () => {
    const wrapper = mount(ShoppingList, {
      props: {
        list: [] as any,
      },
    });

    expect(wrapper.findAll('li')).toHaveLength(0);
  });

  it('handles missing list prop (null/undefined)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(ShoppingList, {
      props: {
        list: null as any,
      },
    });

    expect(wrapper.findAll('li')).toHaveLength(0);
    consoleSpy.mockRestore();
  });

  it('updates item status and emits check when a line is updated', async () => {
    const list = [{ name: 'Apples', amount: 5, unit: 'pcs' as const, checked: false }];
    const wrapper = mount(ShoppingList, {
      props: {
        list,
      },
    });

    const line = wrapper.findComponent(ShoppingListLine);
    await line.vm.$emit('update', true);

    expect(list[0].checked).toBe(true);
    expect(wrapper.emitted('check')).toBeTruthy();
  });
});
