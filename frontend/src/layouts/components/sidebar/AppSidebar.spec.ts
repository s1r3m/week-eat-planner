import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSidebar from './AppSidebar.vue';
import AppBrand from '@/components/shared/AppBrand.vue';
import AppSidebarNavigation from './AppSidebarNavigation.vue';
import AppSidebarFooter from './AppSidebarFooter.vue';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

describe('AppSidebar', () => {
  const mountComponent = () => {
    return mount(AppSidebar, {
      global: {
        stubs: {
          AppBrand: true,
          AppSidebarNavigation: true,
          AppSidebarFooter: true,
          Sidebar: {
            template: '<div><slot /></div>',
            props: ['variant'],
          },
          SidebarHeader: { template: '<div><slot /></div>' },
          SidebarContent: { template: '<div><slot /></div>' },
          SidebarFooter: { template: '<div><slot /></div>' },
          SidebarMenu: { template: '<div><slot /></div>' },
          SidebarMenuItem: { template: '<div><slot /></div>' },
          SidebarMenuButton: {
            template: '<div><slot /></div>',
            props: ['asChild'],
          },
        },
      },
    });
  };

  it('renders Sidebar with inset variant', () => {
    const wrapper = mountComponent();
    const sidebar = wrapper.findComponent(Sidebar);
    expect(sidebar.props('variant')).toBe('inset');
  });

  it('renders AppBrand inside SidebarHeader and MenuButton', () => {
    const wrapper = mountComponent();
    const header = wrapper.findComponent(SidebarHeader);
    const menuButton = header.findComponent(SidebarMenuButton);

    expect(menuButton.props('asChild')).toBeDefined();
    expect(menuButton.findComponent(AppBrand).exists()).toBeTruthy();
  });

  it('renders AppSidebarNavigation inside SidebarContent', () => {
    const wrapper = mountComponent();
    const content = wrapper.getComponent(SidebarContent);
    expect(content.findComponent(AppSidebarNavigation).exists()).toBeTruthy();
  });

  it('renders AppSidebarFooter inside SidebarFooter', () => {
    const wrapper = mountComponent();
    const footer = wrapper.getComponent(SidebarFooter);
    expect(footer.findComponent(AppSidebarFooter).exists()).toBeTruthy();
  });
});
