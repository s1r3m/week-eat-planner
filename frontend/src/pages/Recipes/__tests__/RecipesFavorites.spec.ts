import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipesFavorites from '../RecipesFavorites.vue';
import { useQuery } from '@pinia/colada';
import { ref } from 'vue';

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/api/recipes', () => ({
  getFavoritesQuery: vi.fn(() => ({ key: ['recipes', 'favorites'], query: vi.fn() })),
}));

describe('RecipesFavorites', () => {
  const stubs = {
    PageTitle: {
      template: '<div><h1>{{ header }}</h1></div>',
      props: ['header'],
    },
    RecipesGrid: {
      template: '<div class="recipes-grid" />',
      props: ['recipes'],
    },
    ErrorRetryCard: {
      template: '<div class="error-card" />',
      props: ['error', 'retry'],
    },
    TheLoadingPageState: {
      template: '<div class="loading-state" />',
      props: ['loadingName'],
    },
  };

  it('renders loading state when loading', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(true),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mount(RecipesFavorites, { global: { stubs } });
    expect(wrapper.find('.loading-state').exists()).toBe(true);
  });

  it('renders error state when there is an error', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref(new Error('Fetch failed')),
      refetch: vi.fn(),
    });

    const wrapper = mount(RecipesFavorites, { global: { stubs } });
    expect(wrapper.find('.error-card').exists()).toBe(true);
  });

  it('renders recipes grid when data is loaded', () => {
    const mockFavorites = [{ id: '1', name: 'Recipe 1' }];
    (useQuery as any).mockReturnValue({
      data: ref(mockFavorites),
      isLoading: ref(false),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mount(RecipesFavorites, { global: { stubs } });
    expect(wrapper.find('.recipes-grid').exists()).toBe(true);
  });
});
