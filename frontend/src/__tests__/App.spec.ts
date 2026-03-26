import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';

describe('App', () => {
  it('renders without crashing', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          AppShell: { template: '<div class="app"> app </div>' },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
