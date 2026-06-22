import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
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

    // Set values by interacting with inputs since we no longer use v-model props
    await wrapper.find('#recipe-name').setValue('New Recipe');

    // For file input, we trigger change event
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = wrapper.find('#recipe-cover');
    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    });
    await fileInput.trigger('change');

    // For ingredients and steps, we need to find the inputs and set their values
    const ingredientInputs = wrapper.findAll('input[placeholder="Ingredient"]');
    await ingredientInputs[0].setValue('Tomato');
    const amountInputs = wrapper.findAll('input[placeholder="qty"]');
    await amountInputs[0].setValue('2');

    // We might need to wait for the automatic addition of new rows
    await flushPromises();

    const stepInputs = wrapper.findAll('input[placeholder="Do the..."]');
    await stepInputs[0].setValue('Wash tomato');

    await flushPromises();

    const createBtn = wrapper
      .findAll('[data-slot="button"]')
      .find((b) => b.text().includes('Create recipe'));
    expect(createBtn).toBeDefined();

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const createEmissions = wrapper.emitted('create');
    expect(createEmissions).toBeDefined();

    const [payload, image] = createEmissions![0] as [any, any];
    expect(payload).toEqual({
      name: 'New Recipe',
      ingredients: [{ name: 'Tomato', amount: 2, unit: 'g' }],
      steps: [{ order: 1, step: 'Wash tomato' }],
      is_public: true,
    });
    expect(image).toBe(mockFile);
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
