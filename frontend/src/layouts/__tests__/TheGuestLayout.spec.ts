import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import TheGuestLayout from '../TheGuestLayout.vue';

describe('TheGuestLayout', () => {
  it('renders GuestAppHeader, RouterView content and GuestFooter and handles component visibility', async () => {
    const component = ref<any>(h('div', { class: 'child-component' }));
    const wrapper = mount(TheGuestLayout, {
      global: {
        stubs: {
          GuestAppHeader: { template: '<div class="guest-header">Header</div>' },
          GuestFooter: { template: '<div class="guest-footer">Footer</div>' },
          RouterView: defineComponent({
            setup(_, { slots }) {
              return () =>
                slots.default
                  ? slots.default({
                      Component: component.value,
                      route: { fullPath: '/test' },
                    })
                  : null;
            },
          }),
        },
      },
    });

    expect(wrapper.find('.guest-header').exists()).toBe(true);
    expect(wrapper.find('.guest-footer').exists()).toBe(true);
    expect(wrapper.find('.child-component').exists()).toBe(true);

    component.value = null;
    await nextTick();
    expect(wrapper.find('.child-component').exists()).toBe(false);
    expect(wrapper.find('main').exists()).toBe(true);
  });
});
