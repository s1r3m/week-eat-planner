import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekDetails from '../WeekDetails.vue';
import { createRouter, createMemoryHistory } from 'vue-router';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div></div>' } },
    { path: '/week/:id', name: 'week', component: { template: '<div></div>' } },
  ],
});

describe('WeekDetails', () => {
  const mockWeek = { id: 'week_123', name: 'Delicious Week', user_id: 'user_1' };

  const mountComponent = (week = mockWeek) =>
    mount(WeekDetails, { props: { week }, global: { plugins: [router] } });

  it('renders the week name', () => {
    expect(mountComponent().text()).toContain(mockWeek.name);
  });

  it('renders an image with alt text and lazy loading', () => {
    const img = mountComponent().find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Delicious Week cover image');
    expect(img.attributes('loading')).toBe('lazy');
  });

  it('renders a link to the week page', () => {
    const link = mountComponent().find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/week/week_123');
  });

  it('applies reduced-opacity classes when the week id starts with temp-id', () => {
    const card = mountComponent({ ...mockWeek, id: 'temp-id-123' }).find('[data-slot="card"]');
    expect(card.classes()).toContain('opacity-50');
    expect(card.classes()).toContain('pointer-events-none');
  });
});
