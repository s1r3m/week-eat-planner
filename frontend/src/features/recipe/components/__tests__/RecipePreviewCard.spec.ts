import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipePreviewCard from '../RecipePreviewCard.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { Star } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type { RecipePreview } from '@/api/recipes';

const mockMutate = vi.fn();
vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(() => ({ mutate: mockMutate })),
}));

vi.mock('@/api/recipes', () => ({
  toggleFavoriteMutation: vi.fn(),
}));

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div></div>' } },
    { path: '/recipe/:id', name: 'recipe', component: { template: '<div></div>' } },
  ],
});

describe('RecipePreviewCard', () => {
  const recipe: RecipePreview = {
    id: '1',
    name: 'Pasta Carbonara',
    author: 'me',
    is_favorite: false,
    image_url: null,
  };

  beforeEach(() => {
    mockMutate.mockReset();
  });

  const mountComponent = (props = {}) => {
    return mount(RecipePreviewCard, {
      props: {
        recipe,
        ...props,
      },
      global: {
        plugins: [router],
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: {
            template: '<button @click="$emit(\'click\', $event)"><slot /></button>',
          },
          Star: {
            template: '<div class="star-stub" v-bind="$attrs" />',
          },
        },
      },
    });
  };

  it('renders recipe name', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Pasta Carbonara');
  });

  it('renders recipe author', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('me');
  });

  it('renders recipe image with correct src and alt', () => {
    const recipeWithImg = { ...recipe, image_url: 'http://example.com/img.jpg' };
    const wrapper = mountComponent({ recipe: recipeWithImg });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('http://example.com/img.jpg');
    expect(img.attributes('alt')).toBe('Pasta Carbonara');
  });

  it('renders fallback image when image_url is missing', () => {
    const wrapper = mountComponent();
    const img = wrapper.find('img');
    expect(img.attributes('src')).toContain('recipe_bg.png');
  });

  it('toggles favorite and updates star props', async () => {
    const wrapper = mountComponent();
    const starComp = wrapper.findComponent(Star);

    // Initially not favorite
    // Some environments might have a default fill, so we check it's not the primary color
    expect(starComp.attributes('fill')).not.toBe('var(--primary)');

    // Toggle to favorite
    const clickEvent = { stopPropagation: vi.fn() };
    await wrapper.findComponent(Button).trigger('click', clickEvent);

    expect(mockMutate).toHaveBeenCalledWith({ id: recipe.id, is_favorite: recipe.is_favorite });

    // Update prop to see visual change
    await wrapper.setProps({ recipe: { ...recipe, is_favorite: true } });
    expect(starComp.attributes('fill')).toBe('var(--primary)');
  });

  it('adds specific class when recipe id starts with temp-id', () => {
    const tempRecipe = { ...recipe, id: 'temp-id-123' };
    const wrapper = mountComponent({ recipe: tempRecipe });
    expect(wrapper.classes()).toContain('opacity-50');
    expect(wrapper.classes()).toContain('pointer-events-none');
  });
});
