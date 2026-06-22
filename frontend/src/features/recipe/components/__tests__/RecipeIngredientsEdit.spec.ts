import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeIngredientsEdit from '../RecipeIngredientsEdit.vue';
import type { Ingredient } from '@/api/recipes';

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

  it('renders the initial ingredient', () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: { ingredients: defaultIngredients },
    });
    expect(wrapper.findAll('li')).toHaveLength(1);
  });

  it('adds an ingredient automatically when the last one is filled', async () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: [...defaultIngredients],
        'onUpdate:ingredients': (e: any) => wrapper.setProps({ ingredients: e }),
      },
    });
    expect(wrapper.findAll('li')).toHaveLength(1);
    const nameInput = wrapper.find('input[type="text"]');
    await nameInput.setValue('Flour');
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('removes an ingredient when the remove button is clicked', async () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: [...defaultIngredients],
        'onUpdate:ingredients': (e: any) => wrapper.setProps({ ingredients: e }),
      },
    });
    // Add an ingredient by filling the first one
    await wrapper.find('input[type="text"]').setValue('Flour');
    expect(wrapper.findAll('li')).toHaveLength(2);

    // The first one should have a delete button now because it's not the last one
    await wrapper.find('button.text-destructive').trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(1);
  });

  it('updates ingredient name and amount on input', async () => {
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

  it('updates ingredient unit when the select emits a new value', async () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: {
        ingredients: [...defaultIngredients],
        'onUpdate:ingredients': (e: any) => wrapper.setProps({ ingredients: e }),
      },
    });
    await wrapper.findComponent({ name: 'Select' }).vm.$emit('update:modelValue', 'ml');
    expect(wrapper.props('ingredients')[0].unit).toBe('ml');
  });

  it('renders all available unit options', () => {
    const wrapper = mount(RecipeIngredientsEdit, {
      props: { ingredients: defaultIngredients },
    });
    expect(wrapper.text()).toContain('g');
    expect(wrapper.text()).toContain('ml');
    expect(wrapper.text()).toContain('pcs');
    expect(wrapper.text()).toContain('cans');
  });
});
