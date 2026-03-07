import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import AuthAppHeader from './AuthAppHeader.vue';
import ModeToggle from '@/components/shared/ModeToggle.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import SidebarTrigger from '@/components/ui/sidebar/SidebarTrigger.vue';

describe('AuthAppHeader', () => {
  const mountComponent = () =>
    shallowMount(AuthAppHeader, {
      global: {
        stubs: {
          AppHeader: {
            template:
              '<header><slot name="left" /><slot name="center" /><slot name="right" /></header>',
          },
          SidebarTrigger: true,
          Separator: true,
          ModeToggle: true,
          AuthAppBreadcrumbs: true,
        },
      },
    });

  describe('Rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent();
      expect(wrapper.exists()).toBe(true);
    });

    it('renders the logo component', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(Separator).exists()).toBe(true);
    });

    it('renders ModeToggle component', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(ModeToggle).exists()).toBe(true);
    });

    it('renders navigation menu', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(SidebarTrigger).exists()).toBe(true);
    });
  });
});
