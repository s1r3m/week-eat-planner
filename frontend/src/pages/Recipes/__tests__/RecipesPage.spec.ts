import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipesPage from '../RecipesPage.vue';

describe('RecipesPage', () => {
  it('renders correctly', () => {
    const wrapper = mount(RecipesPage, {
      global: {
        stubs: {
          PageTitle: {
            template: '<div><h1>{{ header }}</h1></div>',
            props: ['header'],
          },
        },
      },
    });
    expect(wrapper.text()).toContain('Recipes');
    expect(wrapper.text()).toContain('The page is under constrction');
  });
});
