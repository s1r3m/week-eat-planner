import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipePreview from '../RecipePreview.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import type { RecipeMinimal } from '@/domain/recipe/models';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/recipe/:id', name: 'recipe', component: { template: '<div></div>' } }],
});

describe('RecipePreview', () => {
  const recipe: RecipeMinimal = {
    id: '1',
    name: 'Pasta Carbonara',
    isFavorite: false,
  };

  const mountComponent = (props = {}) => {
    return mount(RecipePreview, {
      props: {
        recipe,
        ...props,
      },
      global: {
        plugins: [router],
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Star: { template: '<div class="star-stub" v-bind="$attrs" />' },
        },
      },
    });
  };

  it('renders recipe name', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Pasta Carbonara');
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

  it('emits toggleFavorite when star button is clicked', async () => {
    const wrapper = mountComponent();
    const starBtn = wrapper.find('button');
    await starBtn.trigger('click', { stopPropagation: () => {} });
    expect(wrapper.emitted('toggleFavorite')).toBeTruthy();
    expect(wrapper.emitted('toggleFavorite')?.[0]).toEqual([recipe]);
  });

  it('shows filled star when recipe is favorite', () => {
    const favoriteRecipe = { ...recipe, isFavorite: true };
    const wrapper = mountComponent({ recipe: favoriteRecipe });
    const star = wrapper.find('svg');
    expect(star.attributes('fill')).toBe('var(--primary)');
  });
});
