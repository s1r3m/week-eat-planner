import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeSteps from '../RecipeSteps.vue';

describe('RecipeSteps', () => {
  it('renders each step in order', () => {
    const steps = [
      { order: 1, step: 'Boil water' },
      { order: 2, step: 'Add salt' },
    ];
    const wrapper = mount(RecipeSteps, { props: { steps } });
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].text()).toBe('Boil water');
    expect(items[1].text()).toBe('Add salt');
  });

  it('renders an empty list when no steps are provided', () => {
    const wrapper = mount(RecipeSteps, { props: { steps: [] } });
    expect(wrapper.findAll('li')).toHaveLength(0);
  });
});
