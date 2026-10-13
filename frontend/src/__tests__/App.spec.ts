import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';

describe('App', () => {
  it('renders without crashing', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          AppShell: { template: '<div class="app"> app </div>' },
          Toaster: { template: '<div class="toaster"> toaster </div>' },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
