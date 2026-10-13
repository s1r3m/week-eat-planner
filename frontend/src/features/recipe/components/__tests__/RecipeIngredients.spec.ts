import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeIngredients from '../RecipeIngredients.vue';
import type { Ingredient } from '@/api/recipes';

describe('RecipeIngredients', () => {
  it('renders each ingredient with its amount and unit', () => {
    const ingredients: Ingredient[] = [
      { name: 'Water', amount: 100, unit: 'ml' },
      { name: 'Flour', amount: 500, unit: 'g' },
    ];
    const wrapper = mount(RecipeIngredients, { props: { ingredients } });
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].text()).toContain('Water');
    expect(items[0].text()).toContain('100 ml');
    expect(items[1].text()).toContain('Flour');
    expect(items[1].text()).toContain('500 g');
  });

  it('renders an empty list when no ingredients are provided', () => {
    const wrapper = mount(RecipeIngredients, { props: { ingredients: [] } });
    expect(wrapper.findAll('li')).toHaveLength(0);
  });
});
