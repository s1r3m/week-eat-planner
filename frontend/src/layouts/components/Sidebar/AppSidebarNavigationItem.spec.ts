import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { useRoute } from 'vue-router';
import { useSidebar } from '@/components/ui/sidebar';
import AppSidebarNavigationItem from './AppSidebarNavigationItem.vue';
import type { NavLink } from '@/layouts/components/header/types/navigation';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(),
}));

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
  const MockIcon = { template: '<svg data-testid="mock-icon" />' };
  const mockItem: NavLink = {
    to: '/test',
    label: 'Test Item',
    icon: MockIcon as any,
  };

  const mountComponent = (props = {}) => {
    return mount(AppSidebarNavigationItem, {
      props: {
        item: mockItem,
        ...props,
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
  };

  it('renders SidebarMenuButton by default', () => {
    vi.mocked(useRoute).mockReturnValue({ path: '/' } as any);
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);

    const wrapper = mountComponent();
    expect(wrapper.find('[data-testid="sidebar-menu-button"]').exists()).toBeTruthy();
  });

  it('renders SidebarMenuSubButton when variant is child', () => {
    vi.mocked(useRoute).mockReturnValue({ path: '/' } as any);
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);

    const wrapper = mountComponent({ variant: 'child' });
    expect(wrapper.find('[data-testid="sidebar-menu-sub-button"]').exists()).toBeTruthy();
  });

  it('sets isActive to true when current route matches item.to', () => {
    vi.mocked(useRoute).mockReturnValue({ path: '/test' } as any);
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);

    const wrapper = mountComponent();
    const button = wrapper.findComponent({ name: 'SidebarMenuButton' });
    expect(button.props('isActive')).toBe(true);
  });

  it('sets isActive to false when current route does not match item.to', () => {
    vi.mocked(useRoute).mockReturnValue({ path: '/other' } as any);
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);

    const wrapper = mountComponent();
    const button = wrapper.findComponent({ name: 'SidebarMenuButton' });
    expect(button.props('isActive')).toBe(false);
  });

  it('closes sidebar on mobile after clicking the link', async () => {
    const setOpenMobile = vi.fn();
    vi.mocked(useRoute).mockReturnValue({ path: '/' } as any);
    vi.mocked(useSidebar).mockReturnValue({ isMobile: { value: true }, setOpenMobile } as any);

    const wrapper = mountComponent();
    const link = wrapper.findComponent(RouterLinkStub);
    await link.trigger('click');

    expect(setOpenMobile).toHaveBeenCalledWith(false);
  });

  it('does not close sidebar on desktop after clicking the link', async () => {
    const setOpenMobile = vi.fn();
    vi.mocked(useRoute).mockReturnValue({ path: '/' } as any);
    vi.mocked(useSidebar).mockReturnValue({ isMobile: { value: false }, setOpenMobile } as any);

    const wrapper = mountComponent();
    const link = wrapper.findComponent(RouterLinkStub);
    await link.trigger('click');

    expect(setOpenMobile).not.toHaveBeenCalled();
  });

  it('renders the icon if provided', () => {
    vi.mocked(useRoute).mockReturnValue({ path: '/' } as any);
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);

    const wrapper = mountComponent();
    expect(wrapper.find('[data-testid="mock-icon"]').exists()).toBeTruthy();
  });
});
