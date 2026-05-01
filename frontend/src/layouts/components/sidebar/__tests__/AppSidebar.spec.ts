import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSidebar from '../AppSidebar.vue';
import AppBrand from '@/components/shared/AppBrand.vue';
import AppSidebarNavigation from '../AppSidebarNavigation.vue';
import AppSidebarFooter from '../AppSidebarFooter.vue';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

describe('AppSidebar', () => {
  const mountComponent = () =>
    mount(AppSidebar, {
      global: {
        stubs: {
          AppBrand: true,
          AppSidebarNavigation: true,
          AppSidebarFooter: true,
          Sidebar: { template: '<div><slot /></div>', props: ['variant'] },
          SidebarHeader: { template: '<div><slot /></div>' },
          SidebarContent: { template: '<div><slot /></div>' },
          SidebarFooter: { template: '<div><slot /></div>' },
          SidebarMenu: { template: '<div><slot /></div>' },
          SidebarMenuItem: { template: '<div><slot /></div>' },
          SidebarMenuButton: { template: '<div><slot /></div>', props: ['asChild'] },
        },
      },
    });

  it('uses the inset variant on the Sidebar', () => {
    expect(mountComponent().findComponent(Sidebar).props('variant')).toBe('inset');
  });

  it('renders AppBrand inside SidebarMenuButton in the header', () => {
    const wrapper = mountComponent();
    const menuButton = wrapper.findComponent(SidebarHeader).findComponent(SidebarMenuButton);
    expect(menuButton.props('asChild')).toBeDefined();
    expect(menuButton.findComponent(AppBrand).exists()).toBe(true);
  });

  it('renders AppSidebarNavigation inside SidebarContent', () => {
    expect(
      mountComponent().getComponent(SidebarContent).findComponent(AppSidebarNavigation).exists(),
    ).toBe(true);
  });

  it('renders AppSidebarFooter inside SidebarFooter', () => {
    expect(
      mountComponent().getComponent(SidebarFooter).findComponent(AppSidebarFooter).exists(),
    ).toBe(true);
  });
});
