import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, Suspense } from 'vue';
import AppShell from '../AppShell.vue';

describe('AppShell', () => {
  const TestAppShell = defineComponent({
    render() {
      return h(Suspense, null, {
        default: () => h(AppShell),
        fallback: () => h('div', { class: 'loading' }, 'Loading...'),
      });
    },
  });

  it('renders the child component passed by RouterView', async () => {
    const wrapper = mount(TestAppShell, {
      global: {
        stubs: {
          RouterView: defineComponent({
            setup(_, { slots }) {
              return () =>
                slots.default
                  ? slots.default({
                      Component: h('div', { class: 'child-component' }),
                      route: { meta: { requiresAuth: true } },
                    })
                  : null;
            },
          }),
        },
      },
    });

    await flushPromises();

    expect(wrapper.find('.child-component').exists()).toBe(true);
  });

  it('renders guest layout when requiresAuth is false', async () => {
    const wrapper = mount(TestAppShell, {
      global: {
        stubs: {
          RouterView: defineComponent({
            setup(_, { slots }) {
              return () =>
                slots.default
                  ? slots.default({
                      Component: h('div', { class: 'guest-component' }),
                      route: { meta: { requiresAuth: false } },
                    })
                  : null;
            },
          }),
        },
      },
    });

    await flushPromises();

    expect(wrapper.find('.guest-component').exists()).toBe(true);
  });
});
