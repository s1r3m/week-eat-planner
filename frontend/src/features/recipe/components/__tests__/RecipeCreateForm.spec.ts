import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeCreateForm from '../RecipeCreateForm.vue';
import RecipeInfoEdit from '../RecipeInfoEdit.vue';
import RecipeIngredientsEdit from '../RecipeIngredientsEdit.vue';
import RecipeStepsEdit from '../RecipeStepsEdit.vue';

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

describe('RecipeCreateForm', () => {
  it('renders all section components', () => {
    const wrapper = mount(RecipeCreateForm);
    expect(wrapper.getComponent(RecipeInfoEdit)).toBeDefined();
    expect(wrapper.getComponent(RecipeIngredientsEdit)).toBeDefined();
    expect(wrapper.getComponent(RecipeStepsEdit)).toBeDefined();
  });

  it('collects values from all sections and emits create on submit', async () => {
    const wrapper = mount(RecipeCreateForm);

    await wrapper.getComponent(RecipeInfoEdit).vm.$emit('update:name', 'New Recipe');
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    await wrapper.getComponent(RecipeInfoEdit).vm.$emit('update:cover', mockFile);
    await wrapper.getComponent(RecipeIngredientsEdit).vm.$emit('update:ingredients', [
      { name: 'Tomato', amount: 2, unit: 'pcs' },
      { name: '', amount: 0, unit: 'g' },
    ]);
    await wrapper.getComponent(RecipeStepsEdit).vm.$emit('update:steps', [
      { order: 0, step: 'Wash tomato' },
      { order: 1, step: '' },
    ]);

    const createBtn = wrapper
      .findAll('[data-slot="button"]')
      .find((b) => b.text().includes('Create recipe'));
    expect(createBtn).toBeDefined();
    await createBtn!.trigger('click');

    const emitted = wrapper.emitted('create');
    expect(emitted).toBeTruthy();
    expect(emitted?.[0][0]).toEqual({
      name: 'New Recipe',
      ingredients: [{ name: 'Tomato', amount: 2, unit: 'pcs' }],
      steps: [{ order: 0, step: 'Wash tomato' }],
      is_public: true,
    });
    expect(emitted?.[0][1]).toBe(mockFile);
  });

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = mount(RecipeCreateForm);
    const cancelBtn = wrapper
      .findAll('[data-slot="button"]')
      .find((b) => b.text().includes('Cancel'));
    expect(cancelBtn).toBeDefined();
    await cancelBtn!.trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
