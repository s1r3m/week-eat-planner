import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WeeksGrid from '../WeeksGrid.vue';
import WeekDetails from '../WeekDetails.vue';

describe('WeeksGrid', () => {
  const mockWeeks = [
    { id: '1', name: 'Week 1', user_id: 'u1' },
    { id: '2', name: 'Week 2', user_id: 'u1' },
  ];

  const stubs = {
    Card: { template: '<div class="card"><slot /></div>' },
    WeekDetails: {
      template:
        '<div class="week-details"><button @click="$emit(\'edit\', week)">Edit</button><button @click="$emit(\'delete\', week)">Delete</button></div>',
      props: ['week'],
      emits: ['edit', 'delete'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all weeks from props', () => {
    const wrapper = mount(WeeksGrid, {
      props: {
        weeks: mockWeeks,
      },
      global: {
        stubs,
      },
    });

    const weeks = wrapper.findAllComponents(WeekDetails);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].props('week')).toEqual(mockWeeks[0]);
    expect(weeks[1].props('week')).toEqual(mockWeeks[1]);
  });

  it('renders correctly with exactly 8 weeks', () => {
    const eightWeeks = Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      name: `Week ${i + 1}`,
      user_id: 'u1',
    }));

    const wrapper = mount(WeeksGrid, {
      props: {
        weeks: eightWeeks,
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.findAllComponents(WeekDetails)).toHaveLength(8);
  });

  it('renders correctly with 0 weeks', () => {
    const wrapper = mount(WeeksGrid, {
      props: {
        weeks: [],
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.findAllComponents(WeekDetails)).toHaveLength(0);
    expect(wrapper.text()).toContain('No weeks yet');
    expect(wrapper.text()).toContain('Try and add one to start your planning journey!');
  });
});
