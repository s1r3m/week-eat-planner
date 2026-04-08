import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeCreateForm from '../RecipeCreateForm.vue';
import RecipeInfoEdit from '../RecipeInfoEdit.vue';
import RecipeIngredientsEdit from '../RecipeIngredientsEdit.vue';
import RecipeStepsEdit from '../RecipeStepsEdit.vue';

describe('RecipeCreateForm', () => {
  it('renders all sections', () => {
    const wrapper = mount(RecipeCreateForm);
    expect(wrapper.getComponent(RecipeInfoEdit)).toBeDefined();
    expect(wrapper.getComponent(RecipeIngredientsEdit)).toBeDefined();
    expect(wrapper.getComponent(RecipeStepsEdit)).toBeDefined();
  });

  it('updates state on child component updates', async () => {
    const wrapper = mount(RecipeCreateForm);

    const infoEdit = wrapper.getComponent(RecipeInfoEdit);
    await infoEdit.vm.$emit('update:name', 'New Recipe');
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    await infoEdit.vm.$emit('update:cover', mockFile);

    const ingredientsEdit = wrapper.getComponent(RecipeIngredientsEdit);
    await ingredientsEdit.vm.$emit('update:ingredients', [
      { name: 'Tomato', amount: 2, unit: 'pcs' },
    ]);

    const stepsEdit = wrapper.getComponent(RecipeStepsEdit);
    await stepsEdit.vm.$emit('update:steps', [{ order: 0, step: 'Wash tomato' }]);

    const createBtn = wrapper.findAll('button').find((b) => b.text().includes('Create recipe'));
    await createBtn?.trigger('click');

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

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(RecipeCreateForm);
    const cancelBtn = wrapper.findAll('button').find((b) => b.text().includes('Cancel'));
    await cancelBtn?.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });
});
