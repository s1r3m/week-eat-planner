import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeIngredientsEdit from '../RecipeIngredientsEdit.vue';
import type { Ingredient } from '@/api/recipes';

// Mock Select because Radix UI is hard to test in JSDOM without proper setup
vi.mock('@/components/ui/select', () => ({
  Select: {
    name: 'Select',
    template: '<div><slot /></div>',
    props: ['modelValue', 'defaultValue'],
    emits: ['update:modelValue'],
  },
  SelectContent: { template: '<div><slot /></div>' },
  SelectGroup: { template: '<div><slot /></div>' },
  SelectItem: { template: '<div><slot /></div>' },
  SelectTrigger: { template: '<div><slot /></div>' },
  SelectValue: { template: '<div><slot /></div>' },
}));

describe('RecipeIngredientsEdit', () => {
  const defaultIngredients: Ingredient[] = [{ name: '', amount: 0, unit: 'g' }];

  it('renders initial ingredient', () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: defaultIngredients,
      },
    });
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(1);
  });

  it('adds an ingredient', async () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: [...defaultIngredients],
        'onUpdate:ingredients': (e: any) => wrapper.setProps({ ingredients: e }),
      },
    });
    const buttons = wrapper.findAll('button');
    const addButton = buttons.find((b) => b.text().includes('Add an ingredient'));
    await addButton?.trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('removes an ingredient', async () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: [...defaultIngredients],
        'onUpdate:ingredients': (e: any) => wrapper.setProps({ ingredients: e }),
      },
    });
    // Add one first
    const buttons = wrapper.findAll('button');
    const addButton = buttons.find((b) => b.text().includes('Add an ingredient'));
    await addButton?.trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(2);

    // Remove first one
    const removeBtn = wrapper.find('button.text-destructive');
    await removeBtn.trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(1);
  });

  it('updates ingredient name and amount', async () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: [...defaultIngredients],
        'onUpdate:ingredients': (e: any) => wrapper.setProps({ ingredients: e }),
      },
    });
    const nameInput = wrapper.find('input[type="text"]');
    const amountInput = wrapper.find('input[type="number"]');

    await nameInput.setValue('Flour');
    await amountInput.setValue(500);

    expect((nameInput.element as HTMLInputElement).value).toBe('Flour');
    expect((amountInput.element as HTMLInputElement).value).toBe('500');
  });

  it('updates ingredient unit via select', async () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: [...defaultIngredients],
        'onUpdate:ingredients': (e: any) => wrapper.setProps({ ingredients: e }),
      },
    });

    const select = wrapper.findComponent({ name: 'Select' });
    await select.vm.$emit('update:modelValue', 'ml');

    expect(wrapper.props('ingredients')[0].unit).toBe('ml');
  });

  it('renders select units', () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: defaultIngredients,
      },
    });
    // Check if the v-for units are rendered
    expect(wrapper.text()).toContain('g');
    expect(wrapper.text()).toContain('ml');
    expect(wrapper.text()).toContain('pcs');
    expect(wrapper.text()).toContain('cans');
  });
});
