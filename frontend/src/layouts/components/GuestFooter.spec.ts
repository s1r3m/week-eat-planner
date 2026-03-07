import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GuestFooter from './GuestFooter.vue';

describe('GuestFooter', () => {
  it('renders component', () => {
    const wrapper = mount(GuestFooter);

    expect(wrapper.html()).toContain('Week Eat Planner');
    expect(wrapper.html()).toContain('s1r3m');
  });

  it('has correct links', () => {
    const wrapper = mount(GuestFooter);

    const links = wrapper.findAll('a');

    expect(links).toHaveLength(1);
    expect(links[0].attributes('href')).toBe('https://github.com/s1r3m/week-eat-planner');
  });

  it('has correct date generated', () => {
    const wrapper = mount(GuestFooter);

    const currentYear = new Date().getFullYear();

    expect(wrapper.html()).toContain(`© ${currentYear} `);
  });
});
