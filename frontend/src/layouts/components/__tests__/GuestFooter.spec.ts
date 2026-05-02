import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GuestFooter from '../GuestFooter.vue';

describe('GuestFooter', () => {
  it('renders the brand name and author', () => {
    const wrapper = mount(GuestFooter);
    expect(wrapper.html()).toContain('Week Eat Planner');
    expect(wrapper.html()).toContain('s1r3m');
  });

  it('renders a link to the GitHub repository', () => {
    const links = mount(GuestFooter).findAll('a');
    expect(links).toHaveLength(1);
    expect(links[0].attributes('href')).toBe('https://github.com/s1r3m/week-eat-planner');
  });

  it('renders the current year in the copyright notice', () => {
    const currentYear = new Date().getFullYear();
    expect(mount(GuestFooter).html()).toContain(`© ${currentYear} `);
  });
});
