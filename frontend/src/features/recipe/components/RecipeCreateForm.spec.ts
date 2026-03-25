import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeCreateForm from './RecipeCreateForm.vue';
import RecipeInfoEdit from './RecipeInfoEdit.vue';
import RecipeIngredientsEdit from './RecipeIngredientsEdit.vue';
import RecipeStepsEdit from './RecipeStepsEdit.vue';

describe('RecipeCreateForm', () => {
  it('renders all sections', () => {
    const wrapper = mount(RecipeCreateForm);
    expect(wrapper.getComponent(RecipeInfoEdit)).toBeDefined();
    expect(wrapper.getComponent(RecipeIngredientsEdit)).toBeDefined();
    expect(wrapper.getComponent(RecipeStepsEdit)).toBeDefined();
  });
});
