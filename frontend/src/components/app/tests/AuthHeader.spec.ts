import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthHeader from '../AuthHeader.vue';

describe('AuthHeader', () => {
  it('renders component', () => {
    const wrapper = mount(AuthHeader, {
      global: {
        stubs: {
          SidebarTrigger: { template: '<div class="sidebar-trigger-stub"></div>' },
          Separator: { template: '<div class="separator-stub"></div>' },
          TheBreadcrumbs: { template: '<div class="the-breadcrumbs-stub"></div>' },
        },
      },
    });

    expect(wrapper.html()).toContain('sidebar-trigger-stub');
    expect(wrapper.html()).toContain('separator-stub');
    expect(wrapper.html()).toContain('the-breadcrumbs-stub');
  });
});
