import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekDetails from '../WeekDetails.vue';

describe('WeekDetails', () => {
  const mockWeek = { id: 'week_123', name: 'Delicious Week', user_id: 'user_1' };

  const stubs = {
    'router-link': {
      template: '<a :href="to.name + \'/\' + to.params.id"><slot /></a>',
      props: ['to'],
    },
  };

  it('renders week name correctly', () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: { week: mockWeek },
    });

    expect(wrapper.text()).toContain(mockWeek.name);
  });

  it('renders image with correct attributes', () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: { week: mockWeek },
    });

    const img = wrapper.find('img');

    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Delicious Week cover image');
    expect(img.attributes('loading')).toBe('lazy');
    expect(img.attributes('src')).toBeDefined();
  });

  it('renders router-link with correct destination', () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: { week: mockWeek },
    });

    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    // Based on our stub:
    expect(link.attributes('href')).toBe('week/week_123');
  });

  it('applies pending classes when week id starts with temp-id', () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: {
        week: { ...mockWeek, id: 'temp-id-123' },
      },
    });

    const card = wrapper.find('[data-slot="card"]');
    expect(card.classes()).toContain('opacity-50');
    expect(card.classes()).toContain('pointer-events-none');
  });
});
