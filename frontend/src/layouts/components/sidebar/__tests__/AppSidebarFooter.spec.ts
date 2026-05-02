import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';
import AppSidebarFooter from '../AppSidebarFooter.vue';
import { UserIdentity } from '@/features/auth';
import { useSidebar } from '@/components/ui/sidebar';
import { useMutation, useQuery } from '@pinia/colada';

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(),
  SidebarMenu: { template: '<div><slot /></div>' },
  SidebarMenuItem: { template: '<div><slot /></div>' },
  SidebarMenuButton: { template: '<div><slot /></div>' },
}));

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  getUserQuery: vi.fn(),
  logoutMutation: vi.fn(),
}));

describe('AppSidebarFooter', () => {
  const mockUser = { id: '1', email: 'john@example.com', is_active: true };
  const mockLogout = vi.fn();

  const mountComponent = (initialState: { user?: any } = { user: mockUser }) => {
    vi.mocked(useMutation).mockReturnValue({ mutate: mockLogout } as any);
    vi.mocked(useQuery).mockReturnValue({ data: ref(initialState.user ?? null) } as any);

    return mount(AppSidebarFooter, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          RouterLink: RouterLinkStub,
          UserIdentity: true,
          DropdownMenu: { template: '<div><slot /></div>' },
          DropdownMenuContent: { template: '<div><slot /></div>' },
          DropdownMenuItem: { template: '<div><slot /></div>' },
          DropdownMenuGroup: { template: '<div><slot /></div>' },
          DropdownMenuLabel: { template: '<div><slot /></div>' },
          DropdownMenuSeparator: { template: '<div><slot /></div>' },
          DropdownMenuTrigger: { template: '<div><slot /></div>' },
          ChevronsUpDown: { template: '<svg/>' },
          LogOut: { template: '<svg/>' },
        },
      },
    });
  };

  const withSidebar = (isMobile: boolean) =>
    vi
      .mocked(useSidebar)
      .mockReturnValue({ isMobile: { value: isMobile }, setOpenMobile: vi.fn() } as any);

  it('renders UserIdentity when a user is logged in', () => {
    withSidebar(false);
    expect(mountComponent().findComponent(UserIdentity).exists()).toBe(true);
  });

  it('does not render UserIdentity when no user is logged in', () => {
    withSidebar(false);
    expect(mountComponent({ user: null }).findComponent(UserIdentity).exists()).toBe(false);
  });

  it('calls logout when the Log Out link is clicked', async () => {
    withSidebar(false);
    const wrapper = mountComponent();
    const logoutLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((l) => l.text().includes('Log Out'));
    expect(logoutLink).toBeDefined();
    await logoutLink!.trigger('click');
    expect(mockLogout).toHaveBeenCalled();
  });

  it('closes the sidebar on mobile when Profile is clicked', async () => {
    const setOpenMobile = vi.fn();
    vi.mocked(useSidebar).mockReturnValue({ isMobile: { value: true }, setOpenMobile } as any);
    const wrapper = mountComponent();
    const profileLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((l) => l.text().includes('Profile'));
    expect(profileLink).toBeDefined();
    await profileLink!.trigger('click');
    expect(setOpenMobile).toHaveBeenCalledWith(false);
  });

  it('does not close the sidebar on desktop when Profile is clicked', async () => {
    const setOpenMobile = vi.fn();
    vi.mocked(useSidebar).mockReturnValue({ isMobile: { value: false }, setOpenMobile } as any);
    const wrapper = mountComponent();
    const profileLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((l) => l.text().includes('Profile'));
    expect(profileLink).toBeDefined();
    await profileLink!.trigger('click');
    expect(setOpenMobile).not.toHaveBeenCalled();
  });
});
