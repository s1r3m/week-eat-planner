import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeHero from '../RecipeHero.vue';
import RecipeIngredients from '../RecipeIngredients.vue';
import RecipeCover from '../RecipeCover.vue';

describe('RecipeHero', () => {
  it('passes correct props to subcomponents', () => {
    const recipe = {
      id: '1',
      name: 'Pasta',
      cover_url: 'pasta.jpg',
      ingredients: [{ name: 'Pasta', amount: 500, unit: 'g' }],
      steps: [],
    };
    const wrapper = mount(RecipeHero, {
      props: {
        recipe: recipe as any,
      },
    });

    const ingredientsComp = wrapper.getComponent(RecipeIngredients);
    expect(ingredientsComp.props('ingredients')).toEqual(recipe.ingredients);

    const coverComp = wrapper.getComponent(RecipeCover);
    expect(coverComp.props('src')).toBe(recipe.cover_url);
    expect(coverComp.props('alt')).toBe(recipe.name);
  });
});
