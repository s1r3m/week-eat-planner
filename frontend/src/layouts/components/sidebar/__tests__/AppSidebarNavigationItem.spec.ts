import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { useRoute } from 'vue-router';
import { useSidebar } from '@/components/ui/sidebar';
import AppSidebarNavigationItem from '../AppSidebarNavigationItem.vue';
import type { NavLink } from '@/layouts/components/header/types/navigation';
import { markRaw } from 'vue';

vi.mock('vue-router', () => ({ useRoute: vi.fn() }));
vi.mock('@/components/ui/sidebar', () => ({ useSidebar: vi.fn() }));

vi.mock('@/components/ui/sidebar/SidebarMenuButton.vue', () => ({
  default: {
    name: 'SidebarMenuButton',
    template: '<div data-testid="sidebar-menu-button"><slot /></div>',
    props: ['isActive', 'asChild'],
  },
}));

vi.mock('@/components/ui/sidebar/SidebarMenuSubButton.vue', () => ({
  default: {
    name: 'SidebarMenuSubButton',
    template: '<div data-testid="sidebar-menu-sub-button"><slot /></div>',
    props: ['isActive', 'asChild'],
  },
}));

describe('AppSidebarNavigationItem', () => {
  const MockIcon = markRaw({ template: '<svg data-testid="mock-icon" />' });
  const mockItem: NavLink = { to: { name: 'test' }, label: 'Test Item', icon: MockIcon as any };

  const withRoute = (name: string, path = '/') =>
    vi.mocked(useRoute).mockReturnValue({ name, path } as any);
  const withSidebar = (isMobile = false) =>
    vi
      .mocked(useSidebar)
      .mockReturnValue({ isMobile: { value: isMobile }, setOpenMobile: vi.fn() } as any);

  const mountComponent = (props = {}) =>
    mount(AppSidebarNavigationItem, {
      props: { item: mockItem, ...props },
      global: { stubs: { RouterLink: RouterLinkStub } },
    });

  it('renders SidebarMenuButton by default', () => {
    withRoute('/');
    withSidebar();
    expect(mountComponent().find('[data-testid="sidebar-menu-button"]').exists()).toBe(true);
  });

  it('renders SidebarMenuSubButton when variant is child', () => {
    withRoute('/');
    withSidebar();
    expect(
      mountComponent({ variant: 'child' }).find('[data-testid="sidebar-menu-sub-button"]').exists(),
    ).toBe(true);
  });

  it('marks the button as active when the current route matches item.to', () => {
    withRoute('test');
    withSidebar();
    expect(mountComponent().findComponent({ name: 'SidebarMenuButton' }).props('isActive')).toBe(
      true,
    );
  });

  it('marks the button as inactive when the current route does not match', () => {
    withRoute('other');
    withSidebar();
    expect(mountComponent().findComponent({ name: 'SidebarMenuButton' }).props('isActive')).toBe(
      false,
    );
  });

  it('marks the button as active when the route path matches an item with params', () => {
    const itemWithParams: NavLink = {
      to: { name: 'week', params: { id: '123' } },
      label: 'Week 123',
    };
    withRoute('/weeks/123', '/weeks/123');
    withSidebar();
    const wrapper = mount(AppSidebarNavigationItem, {
      props: { item: itemWithParams },
      global: { stubs: { RouterLink: RouterLinkStub } },
    });
    expect(wrapper.findComponent({ name: 'SidebarMenuButton' }).props('isActive')).toBe(true);
  });

  it('closes the sidebar on mobile when the link is clicked', async () => {
    const setOpenMobile = vi.fn();
    withRoute('/');
    vi.mocked(useSidebar).mockReturnValue({ isMobile: { value: true }, setOpenMobile } as any);
    await mountComponent().findComponent(RouterLinkStub).trigger('click');
    expect(setOpenMobile).toHaveBeenCalledWith(false);
  });

  it('does not close the sidebar on desktop when the link is clicked', async () => {
    const setOpenMobile = vi.fn();
    withRoute('/');
    vi.mocked(useSidebar).mockReturnValue({ isMobile: { value: false }, setOpenMobile } as any);
    await mountComponent().findComponent(RouterLinkStub).trigger('click');
    expect(setOpenMobile).not.toHaveBeenCalled();
  });

  it('renders the provided icon', () => {
    withRoute('/');
    withSidebar();
    expect(mountComponent().find('[data-testid="mock-icon"]').exists()).toBe(true);
  });
});
