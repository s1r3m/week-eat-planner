import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipesGrid from '../RecipesGrid.vue';
import type { RecipeMinimal } from '@/domain/recipe/models';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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
});
