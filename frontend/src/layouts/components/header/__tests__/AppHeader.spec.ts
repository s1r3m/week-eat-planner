import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from '../AppHeader.vue';

describe('AppHeader', () => {
  it('renders a header element', () => {
    expect(mount(AppHeader).find('header').exists()).toBe(true);
  });

  it.each([
    { slot: 'left', text: 'Left' },
    { slot: 'center', text: 'Center' },
    { slot: 'right', text: 'Right' },
  ])('renders the $slot slot content', ({ slot, text }) => {
    const wrapper = mount(AppHeader, {
      slots: { [slot]: `<span data-test="${slot}-slot"> ${text} </span>` },
    });
    const el = wrapper.find(`[data-test="${slot}-slot"]`);
    expect(el.exists()).toBe(true);
    expect(el.text()).toBe(text);
  });

  it('renders all three slots simultaneously', () => {
    const wrapper = mount(AppHeader, {
      slots: {
        left: '<span data-test="left-slot">Left</span>',
        center: '<span data-test="center-slot">Center</span>',
        right: '<span data-test="right-slot">Right</span>',
      },
    });
    expect(wrapper.find('[data-test="left-slot"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="center-slot"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="right-slot"]').exists()).toBe(true);
  });

  it('renders an empty header when no slots are provided', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('header').exists()).toBe(true);
    expect(wrapper.text()).toBe('');
  });
});
