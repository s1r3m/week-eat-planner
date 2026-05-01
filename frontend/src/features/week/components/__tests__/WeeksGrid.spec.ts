import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeeksGrid from '../WeeksGrid.vue';
import WeekDetails from '../WeekDetails.vue';
import { createRouter, createMemoryHistory } from 'vue-router';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div></div>' } },
    { path: '/week/:id', name: 'week', component: { template: '<div></div>' } },
  ],
});

describe('WeeksGrid', () => {
  const mockWeeks = [
    { id: '1', name: 'Week 1', user_id: 'u1' },
    { id: '2', name: 'Week 2', user_id: 'u1' },
  ];

  const mountComponent = (weeks = mockWeeks) =>
    mount(WeeksGrid, { props: { weeks }, global: { plugins: [router] } });

  it('renders a WeekDetails card for each week', () => {
    const wrapper = mountComponent();
    const cards = wrapper.findAllComponents(WeekDetails);
    expect(cards).toHaveLength(2);
    expect(cards[0].props('week')).toEqual(mockWeeks[0]);
    expect(cards[1].props('week')).toEqual(mockWeeks[1]);
  });

  describe('empty state', () => {
    it('shows the empty state message when no weeks are provided', () => {
      const wrapper = mountComponent([]);
      expect(wrapper.text()).toContain('No weeks yet');
      expect(wrapper.text()).toContain('Try and add one to start your planning journey!');
    });

    it('renders no WeekDetails cards when the list is empty', () => {
      expect(mountComponent([]).findAllComponents(WeekDetails)).toHaveLength(0);
    });
  });
});
