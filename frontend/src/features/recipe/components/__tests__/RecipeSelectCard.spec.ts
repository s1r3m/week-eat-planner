import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeSelectCard from '../RecipeSelectCard.vue';
import type { RecipePreview } from '@/api/recipes';
import { useMutation } from '@pinia/colada';
import { Star } from 'lucide-vue-next';

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/recipes', () => ({
  toggleFavoriteMutation: vi.fn(),
}));

describe('RecipeSelectCard', () => {
  const mockMutate = vi.fn();
  const mockRecipe: RecipePreview = {
    id: '1',
    name: 'Test Recipe',
    author: 'Test Author',
    is_favorite: false,
    image_url: 'http://example.com/image.jpg',
  };

  beforeEach(() => {
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate } as any);
  });

  const mountComponent = (props = {}) =>
    mount(RecipeSelectCard, {
      props: { recipe: mockRecipe, ...props },
    });

  it('renders recipe name', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Test Recipe');
  });

  it('renders image with correct src and loading attributes', () => {
    const wrapper = mountComponent();
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe(mockRecipe.image_url);
    expect(img.attributes('loading')).toBe('lazy');
  });

  it('falls back to default image when image_url is null', () => {
    const wrapper = mountComponent({ recipe: { ...mockRecipe, image_url: null } });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBeDefined();
    expect(img.attributes('src')).not.toBe('null');
  });

  describe('selection state', () => {
    it('applies selected classes when isSelected is true', () => {
      const wrapper = mountComponent({ isSelected: true });
      expect(wrapper.classes()).toContain('border-primary');
      expect(wrapper.classes()).toContain('bg-primary/8');
    });

    it('applies default classes when isSelected is false', () => {
      const wrapper = mountComponent({ isSelected: false });
      expect(wrapper.classes()).toContain('border-transparent');
      expect(wrapper.classes()).toContain('bg-surface-container-low');
    });
  });

  it('emits select event with the recipe on click', async () => {
    const wrapper = mountComponent();
    await wrapper.trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([mockRecipe]);
  });

  describe('favorite star', () => {
    it('shows filled star when recipe is a favorite', () => {
      const wrapper = mountComponent({ recipe: { ...mockRecipe, is_favorite: true } });
      const star = wrapper.findComponent(Star);
      expect(star.classes()).toContain('fill-primary');
      expect(star.classes()).toContain('text-primary');
    });

    it('shows outlined star when recipe is not a favorite', () => {
      const wrapper = mountComponent();
      const star = wrapper.findComponent(Star);
      expect(star.classes()).toContain('text-on-surface-variant');
      expect(star.classes()).not.toContain('fill-primary');
    });

    it('calls toggle mutation when the star button is clicked', async () => {
      const wrapper = mountComponent();
      await wrapper.find('[data-slot="button"]').trigger('click');
      expect(mockMutate).toHaveBeenCalledWith({
        id: mockRecipe.id,
        is_favorite: mockRecipe.is_favorite,
      });
    });
  });
});
