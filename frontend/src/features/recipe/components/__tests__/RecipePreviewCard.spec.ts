import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipePreviewCard from '../RecipePreviewCard.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { useMutation } from '@pinia/colada';
import { Star } from 'lucide-vue-next';
import type { RecipePreview } from '@/api/recipes';

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
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
  const mockMutate = vi.fn();
  const recipe: RecipePreview = {
    id: '1',
    name: 'Pasta Carbonara',
    author: 'me',
    is_favorite: false,
    image_url: null,
  };

  beforeEach(() => {
    mockMutate.mockReset();
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate } as any);
  });

  const mountComponent = (props = {}) =>
    mount(RecipePreviewCard, {
      props: { recipe, ...props },
      global: { plugins: [router] },
    });

  it('renders recipe name and author', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Pasta Carbonara');
    expect(wrapper.text()).toContain('me');
  });

  it('renders image with correct src and alt when image_url is set', () => {
    const recipeWithImg = { ...recipe, image_url: 'http://example.com/img.jpg' };
    const wrapper = mountComponent({ recipe: recipeWithImg });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('http://example.com/img.jpg');
    expect(img.attributes('alt')).toBe('Pasta Carbonara');
  });

  it('falls back to the default image when image_url is null', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('img').attributes('src')).toContain('recipe_bg.png');
  });

  it('renders a link to the recipe page when isAssign is false', () => {
    const wrapper = mountComponent({ isAssign: false });
    expect(wrapper.find('a').exists()).toBe(true);
  });

  it('does not render a link when isAssign is true', () => {
    const wrapper = mountComponent({ isAssign: true });
    expect(wrapper.find('a').exists()).toBe(false);
  });

  it('applies reduced-opacity classes when the recipe id starts with temp-id', () => {
    const tempRecipe = { ...recipe, id: 'temp-id-123' };
    const wrapper = mountComponent({ recipe: tempRecipe });
    const card = wrapper.find('[data-slot="card"]');
    expect(card.classes()).toContain('opacity-50');
    expect(card.classes()).toContain('pointer-events-none');
  });

  describe('favorite star', () => {
    it('calls toggle mutation with correct args when the star button is clicked', async () => {
      const wrapper = mountComponent();
      await wrapper.find('[data-slot="button"]').trigger('click');
      expect(mockMutate).toHaveBeenCalledWith({ id: recipe.id, is_favorite: recipe.is_favorite });
    });

    it('shows outlined star when recipe is not a favorite', () => {
      const wrapper = mountComponent();
      const star = wrapper.findComponent(Star);
      expect(star.classes()).toContain('text-on-surface-variant');
      expect(star.classes()).not.toContain('fill-primary');
    });

    it('shows filled star when recipe is a favorite', () => {
      const wrapper = mountComponent({ recipe: { ...recipe, is_favorite: true } });
      const star = wrapper.findComponent(Star);
      expect(star.classes()).toContain('fill-primary');
      expect(star.classes()).toContain('text-primary');
    });
  });
});
