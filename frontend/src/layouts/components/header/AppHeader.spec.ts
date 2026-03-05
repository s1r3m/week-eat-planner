import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from './AppHeader.vue';

describe('AppHeader', () => {
  it('renders header element', () => {
    const wrapper = mount(AppHeader);
    const header = wrapper.find('header');

    expect(header.exists()).toBeTruthy();
  });

  it.each([
    { slot: 'left', text: 'Left' },
    { slot: 'center', text: 'Center' },
    { slot: 'right', text: 'Right' },
  ])('renders {slot} slot alone', ({ slot, text }) => {
    const wrapper = mount(AppHeader, {
      slots: {
        [slot]: `<span data-test="${slot}-slot"> ${text} </span>`,
      },
    });
    const testSlot = wrapper.find(`[data-test="${slot}-slot"]`);

    expect(testSlot.exists()).toBeTruthy();
    expect(testSlot.text()).toBe(text);
  });

  it('renders all slots simultaneously', () => {
    const wrapper = mount(AppHeader, {
      slots: {
        left: '<span data-test="left-slot">Left</span>',
        center: '<span data-test="center-slot">Center</span>',
        right: '<span data-test="right-slot">Right</span>',
      },
    });

    expect(wrapper.find('[data-test="left-slot"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="center-slot"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="right-slot"]').exists()).toBeTruthy();
  });

  it('renders without slots', () => {
    const wrapper = mount(AppHeader);

    expect(wrapper.find('header').exists()).toBeTruthy();
    expect(wrapper.text()).toBe('');
  });
});
