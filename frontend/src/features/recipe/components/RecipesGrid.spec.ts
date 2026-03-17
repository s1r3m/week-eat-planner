import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipesGrid from './RecipesGrid.vue';
import type { RecipeMinimal } from '@/domain/recipe/models';

describe('RecipesGrid', () => {
  const recipes: RecipeMinimal[] = [
    { id: '1', name: 'Recipe 1' },
    { id: '2', name: 'Recipe 2' },
  ];

  const mountComponent = (props = {}) => {
    return mount(RecipesGrid, {
      props: {
        recipes,
        ...props,
      },
      global: {
        stubs: {
          RecipePreview: {
            template:
              '<div class="recipe-preview" @toggle-favorite="$emit(\'toggle-favorite\')"></div>',
            emits: ['toggle-favorite'],
          },
          AppAddCard: {
            template: '<div class="app-add-card" @create="$emit(\'create\')"></div>',
            emits: ['create'],
          },
        },
      },
    });
  };

  it('renders correct number of RecipePreview components', () => {
    const wrapper = mountComponent();
    const previews = wrapper.findAll('.recipe-preview');
    expect(previews).toHaveLength(2);
  });

  it('renders AppAddCard', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.app-add-card').exists()).toBe(true);
  });

  it('emits create when AppAddCard emits create', async () => {
    const wrapper = mountComponent();
    const addCard = wrapper.find('.app-add-card');
    await addCard.trigger('create');
    expect(wrapper.emitted('create')).toBeTruthy();
  });

  it('emits toggleFavorite when RecipePreview emits toggle-favorite', async () => {
    const wrapper = mountComponent();
    const preview = wrapper.findAll('.recipe-preview');
    await preview[0].trigger('toggle-favorite');
    expect(wrapper.emitted('toggleFavorite')).toBeTruthy();
    expect(wrapper.emitted('toggleFavorite')?.[0]).toEqual([recipes[0]]);
  });
});
