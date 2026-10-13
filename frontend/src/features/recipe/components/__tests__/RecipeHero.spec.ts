import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeHero from '../RecipeHero.vue';
import RecipeIngredients from '../RecipeIngredients.vue';
import RecipeCover from '../RecipeCover.vue';

describe('RecipeHero', () => {
  it('passes ingredients and cover props to child components', () => {
    const recipe = {
      id: '1',
      name: 'Pasta',
      image_url: 'pasta.jpg',
      ingredients: [{ name: 'Pasta', amount: 500, unit: 'g' }],
      steps: [],
    };
    const wrapper = mount(RecipeHero, { props: { recipe: recipe as any } });

    expect(wrapper.getComponent(RecipeIngredients).props('ingredients')).toEqual(
      recipe.ingredients,
    );
    expect(wrapper.getComponent(RecipeCover).props('src')).toBe(recipe.image_url);
    expect(wrapper.getComponent(RecipeCover).props('alt')).toBe(recipe.name);
  });

  it('handles null image_url by passing empty string to RecipeCover', () => {
    const recipe = {
      id: '1',
      name: 'Pasta',
      image_url: null,
      ingredients: [],
      steps: [],
    };
    const wrapper = mount(RecipeHero, { props: { recipe: recipe as any } });

    expect(wrapper.getComponent(RecipeCover).props('src')).toBe('');
  });
});
