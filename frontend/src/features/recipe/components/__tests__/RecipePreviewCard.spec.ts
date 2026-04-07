import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipePreviewCard from '../RecipePreviewCard.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import type { RecipePreview } from '@/api/recipes';

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
    isFavorite: false,
  };

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
});
