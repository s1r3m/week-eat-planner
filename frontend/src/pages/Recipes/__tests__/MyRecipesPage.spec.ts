import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MyRecipesPage from '../MyRecipesPage.vue';
import { useRouter } from 'vue-router';
import { useQuery } from '@pinia/colada';
import { ref } from 'vue';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/api/recipes', () => ({
  getMyRecipesQuery: vi.fn(() => ({ key: ['recipes', 'mine'], query: vi.fn() })),
}));

describe('MyRecipesPage', () => {
  const stubs = {
    PageTitle: {
      template: '<div><h1>{{ header }}</h1><slot name="controls" /></div>',
      props: ['header'],
    },
    RecipesGrid: {
      template: '<div class="recipes-grid" />',
      props: ['recipes'],
    },
    Button: {
      template: '<button @click="$emit(\'click\')"><slot /></button>',
    },
    Plus: { template: '<div />' },
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

    const wrapper = mount(MyRecipesPage, { global: { stubs } });
    expect(wrapper.find('.loading-state').exists()).toBe(true);
  });

  it('renders error state when there is an error', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref(new Error('Fetch failed')),
      refetch: vi.fn(),
    });

    const wrapper = mount(MyRecipesPage, { global: { stubs } });
    expect(wrapper.find('.error-card').exists()).toBe(true);
  });

  it('renders recipes grid when data is loaded', () => {
    const mockRecipes = [{ id: '1', name: 'Recipe 1' }];
    (useQuery as any).mockReturnValue({
      data: ref(mockRecipes),
      isLoading: ref(false),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mount(MyRecipesPage, { global: { stubs } });
    expect(wrapper.find('.recipes-grid').exists()).toBe(true);
  });

  it('navigates to create recipe page on button click', async () => {
    const push = vi.fn();
    (useRouter as any).mockReturnValue({ push });
    (useQuery as any).mockReturnValue({
      data: ref([]),
      isLoading: ref(false),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mount(MyRecipesPage, { global: { stubs } });
    await wrapper.find('button').trigger('click');
    expect(push).toHaveBeenCalledWith({ name: 'recipes-create' });
  });
});
