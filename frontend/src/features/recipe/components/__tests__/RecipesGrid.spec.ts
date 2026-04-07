import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipesGrid from '../RecipesGrid.vue';
import type { RecipePreview } from '@/api/recipes';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('RecipesGrid', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  const recipes: RecipePreview[] = [
    { id: '1', name: 'Recipe 1', author: 'me' },
    { id: '2', name: 'Recipe 2', author: 'me' },
  ];

  const mountComponent = (props = {}) => {
    return mount(RecipesGrid, {
      props: {
        recipes,
        ...props,
      },
      global: {
        stubs: {
          RecipePreviewCard: {
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

  it('renders correct number of RecipePreviewCard components', () => {
    const wrapper = mountComponent();
    const previews = wrapper.findAll('.recipe-preview');
    expect(previews).toHaveLength(2);
  });

  it('renders empty state when no recipes are provided', async () => {
    const wrapper = mountComponent({ recipes: [] });

    expect(wrapper.text()).toContain('Nothing here yet');
    expect(wrapper.text()).toContain('Browse our recipe collection to start planning!');

    const button = wrapper.findComponent({ name: 'Button' });
    expect(button.exists()).toBe(true);

    await button.trigger('click');
    expect(mockPush).toHaveBeenCalledWith({ name: ROUTE_NAMES.RECIPES });
  });
});
