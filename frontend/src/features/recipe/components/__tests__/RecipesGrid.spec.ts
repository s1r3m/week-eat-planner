import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipesGrid from '../RecipesGrid.vue';
import type { RecipePreview } from '@/api/recipes';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { createRouter, createMemoryHistory } from 'vue-router';

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/recipes', () => ({
  toggleFavoriteMutation: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => ({ push: mockPush }) };
});

describe('RecipesGrid', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div></div>' } },
      { path: '/recipe/:id', name: 'recipe', component: { template: '<div></div>' } },
    ],
  });

  beforeEach(() => {
    vi.mocked(useMutation).mockReturnValue({ mutate: vi.fn() } as any);
  });

  afterEach(() => {
    mockPush.mockClear();
  });

  const recipes: RecipePreview[] = [
    { id: '1', name: 'Recipe 1', author: 'me', is_favorite: false, image_url: null },
    { id: '2', name: 'Recipe 2', author: 'me', is_favorite: false, image_url: null },
  ];

  const mountComponent = (props = {}) =>
    mount(RecipesGrid, {
      props: { recipes, ...props },
      global: { plugins: [router] },
    });

  it('renders a RecipePreviewCard for each recipe', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Recipe 1');
    expect(wrapper.text()).toContain('Recipe 2');
  });

  describe('empty state', () => {
    it('shows the empty state message when no recipes are provided', () => {
      const wrapper = mountComponent({ recipes: [] });
      expect(wrapper.text()).toContain('Nothing here yet');
      expect(wrapper.text()).toContain('Browse our recipe collection to start planning!');
    });

    it('navigates to the recipes page when the empty-state button is clicked', async () => {
      const wrapper = mountComponent({ recipes: [] });
      await wrapper.find('[data-slot="button"]').trigger('click');
      expect(mockPush).toHaveBeenCalledWith({ name: ROUTE_NAMES.RECIPES });
    });
  });
});
