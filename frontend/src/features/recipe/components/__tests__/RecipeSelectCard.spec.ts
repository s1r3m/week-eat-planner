import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeSelectCard from '../RecipeSelectCard.vue';
import type { RecipePreview } from '@/api/recipes';
import { Star } from 'lucide-vue-next';

const mockMutate = vi.fn();
vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(() => ({ mutate: mockMutate })),
}));

vi.mock('@/api/recipes', () => ({
  toggleFavoriteMutation: vi.fn(),
}));

const mockRecipe: RecipePreview = {
  id: '1',
  name: 'Test Recipe',
  author: 'Test Author',
  is_favorite: false,
  image_url: 'http://example.com/image.jpg',
};

describe('RecipeSelectCard', () => {
  const mountComponent = (props = {}) => {
    return mount(RecipeSelectCard, {
      props: {
        recipe: mockRecipe,
        ...props,
      },
      global: {
        stubs: {
          Button: {
            template: '<button @click="$emit(\'click\', $event)"><slot /></button>',
          },
          Badge: {
            template: '<span><slot /></span>',
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
    expect(wrapper.text()).toContain('Test Recipe');
  });

  it('renders image with correct attributes', () => {
    const wrapper = mountComponent();
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe(mockRecipe.image_url);
    expect(img.attributes('loading')).toBe('lazy');
  });

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

  it('renders fallback image when image_url is missing', () => {
    const recipeNoImg = { ...mockRecipe, image_url: null };
    const wrapper = mountComponent({ recipe: recipeNoImg });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBeDefined();
    // defaultImg is a dynamic import in the component, but we can check if it exists
    expect(img.attributes('src')).not.toBe('null');
  });

  it('emits select event on click', async () => {
    const wrapper = mountComponent();
    await wrapper.trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([mockRecipe]);
  });

  it('toggles favorite when star button is clicked', async () => {
    const wrapper = mountComponent();
    const button = wrapper.find('button');
    const clickEvent = { stopPropagation: vi.fn() };
    await button.trigger('click', clickEvent);

    expect(mockMutate).toHaveBeenCalledWith({
      id: mockRecipe.id,
      is_favorite: mockRecipe.is_favorite,
    });
  });

  it('shows filled star when is_favorite is true', () => {
    const favoriteRecipe = { ...mockRecipe, is_favorite: true };
    const wrapper = mountComponent({ recipe: favoriteRecipe });
    const star = wrapper.findComponent(Star);
    expect(star.classes()).toContain('fill-primary');
    expect(star.classes()).toContain('text-primary');
  });

  it('shows outlined star when is_favorite is false', () => {
    const wrapper = mountComponent({ recipe: mockRecipe });
    const star = wrapper.findComponent(Star);
    expect(star.classes()).toContain('text-on-surface-variant');
    expect(star.classes()).not.toContain('fill-primary');
  });
});
