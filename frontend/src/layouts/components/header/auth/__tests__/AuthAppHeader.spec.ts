import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import AuthAppHeader from '../AuthAppHeader.vue';
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

  it('renders the component', () => {
    expect(mountComponent().exists()).toBe(true);
  });

  it('renders the Separator component', () => {
    expect(mountComponent().findComponent(Separator).exists()).toBe(true);
  });

  it('renders the ModeToggle component', () => {
    expect(mountComponent().findComponent(ModeToggle).exists()).toBe(true);
  });

  it('renders the SidebarTrigger component', () => {
    expect(mountComponent().findComponent(SidebarTrigger).exists()).toBe(true);
  });
});
