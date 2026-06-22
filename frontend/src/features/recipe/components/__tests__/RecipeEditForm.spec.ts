import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RecipeEditForm from '../RecipeEditForm.vue';
import RecipeInfoEdit from '../RecipeInfoEdit.vue';
import RecipeIngredientsEdit from '../RecipeIngredientsEdit.vue';
import RecipeStepsEdit from '../RecipeStepsEdit.vue';
import type { RecipeFull } from '@/api/recipes';

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

describe('RecipeEditForm', () => {
  const mockRecipe: RecipeFull = {
    id: '123',
    name: 'Existing Recipe',
    author: 'Test Author',
    is_favorite: false,
    image_url: 'http://example.com/image.jpg',
    isOfficial: false,
    ingredients: [{ name: 'Existing Ingredient', amount: 100, unit: 'g' }],
    steps: [{ order: 1, step: 'Existing Step' }],
  };

  it('renders all section components with initial values', () => {
    const wrapper = mount(RecipeEditForm, { props: { recipe: mockRecipe } });
    expect(wrapper.getComponent(RecipeInfoEdit)).toBeDefined();
    expect(wrapper.getComponent(RecipeIngredientsEdit)).toBeDefined();
    expect(wrapper.getComponent(RecipeStepsEdit)).toBeDefined();
  });

  it('collects values from all sections and emits update on submit', async () => {
    const wrapper = mount(RecipeEditForm, { props: { recipe: mockRecipe } });

    // Set a new value to ensure editing works
    await wrapper.find('#recipe-name').setValue('Updated Recipe');

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const updateEmissions = wrapper.emitted('update');
    expect(updateEmissions).toBeDefined();

    const [payload, image] = updateEmissions![0] as [any, any];
    expect(payload).toEqual({
      name: 'Updated Recipe',
      ingredients: [{ name: 'Existing Ingredient', amount: 100, unit: 'g' }],
      steps: [{ order: 1, step: 'Existing Step' }],
      is_public: true, // Based on the form default/fallback
    });
    expect(image).toBeNull(); // No new image was uploaded
  });

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = mount(RecipeEditForm, { props: { recipe: mockRecipe } });
    const cancelBtn = wrapper
      .findAll('[data-slot="button"]')
      .find((b) => b.text().includes('Cancel'));
    expect(cancelBtn).toBeDefined();
    await cancelBtn!.trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
