import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import TheAuthLayout from '../TheAuthLayout.vue';

describe('TheAuthLayout', () => {
  it('renders all components and handles component visibility', async () => {
    const component = ref<any>(h('div', { class: 'child-component' }));
    const wrapper = mount(TheAuthLayout, {
      global: {
        stubs: {
          SidebarProvider: { template: '<div><slot /></div>' },
          SidebarInset: { template: '<div><slot /></div>' },
          AppSidebar: { template: '<div class="app-sidebar" />' },
          AuthAppHeader: { template: '<div class="auth-header" />' },
          TheLoadingPageState: { template: '<div class="loading-state" />' },
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

    await flushPromises();

    expect(wrapper.find('.app-sidebar').exists()).toBe(true);
    expect(wrapper.find('.auth-header').exists()).toBe(true);
    expect(wrapper.find('.child-component').exists()).toBe(true);

    component.value = null;
    await nextTick();
    expect(wrapper.find('.child-component').exists()).toBe(false);
  });

  it('renders loading state when Component is provided but Suspense is in fallback', async () => {
    const AsyncComp = defineComponent({
      async setup() {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return () => h('div', 'Async Content');
      },
    });

    const wrapper = mount(TheAuthLayout, {
      global: {
        stubs: {
          SidebarProvider: { template: '<div><slot /></div>' },
          SidebarInset: { template: '<div><slot /></div>' },
          AppSidebar: true,
          AuthAppHeader: true,
          TheLoadingPageState: {
            props: ['loadingName'],
            template: '<div class="loading-state">{{ loadingName }}</div>',
          },
          RouterView: defineComponent({
            setup(_, { slots }) {
              return () =>
                slots.default
                  ? slots.default({
                      Component: h(AsyncComp),
                      route: { fullPath: '/test' },
                    })
                  : null;
            },
          }),
        },
      },
    });

    expect(wrapper.find('.loading-state').exists()).toBe(true);
    expect(wrapper.text()).toContain('the page');

    await flushPromises();
  });
});
