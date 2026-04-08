import { describe, it, expect, vi, type Mock } from 'vitest';
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
    (useMutation as unknown as Mock).mockReturnValue({
      mutate: mockLogout,
    });

    (useQuery as unknown as Mock).mockReturnValue({
      data: ref(initialState.user ?? null),
    });

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

  it('renders UserIdentity when user is logged in', () => {
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);
    const wrapper = mountComponent();
    expect(wrapper.findComponent(UserIdentity).exists()).toBeTruthy();
  });

  it('does not render trigger when user is not logged in', () => {
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);
    const wrapper = mountComponent({ user: null });
    expect(wrapper.findComponent(UserIdentity).exists()).toBeFalsy();
  });

  it('calls logout when Log Out is clicked', async () => {
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);
    const wrapper = mountComponent();

    const logoutLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text().includes('Log Out'));
    expect(logoutLink).toBeDefined();

    await logoutLink!.trigger('click');
    expect(mockLogout).toHaveBeenCalled();
  });

  it('closes sidebar on mobile after clicking Profile', async () => {
    const setOpenMobile = vi.fn();
    vi.mocked(useSidebar).mockReturnValue({ isMobile: { value: true }, setOpenMobile } as any);
    const wrapper = mountComponent();

    const profileLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text().includes('Profile'));
    expect(profileLink).toBeDefined();

    await profileLink!.trigger('click');
    expect(setOpenMobile).toHaveBeenCalledWith(false);
  });

  it('does not close sidebar on desktop after clicking Profile', async () => {
    const setOpenMobile = vi.fn();
    vi.mocked(useSidebar).mockReturnValue({ isMobile: { value: false }, setOpenMobile } as any);
    const wrapper = mountComponent();

    const profileLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text().includes('Profile'));
    expect(profileLink).toBeDefined();

    await profileLink!.trigger('click');
    expect(setOpenMobile).not.toHaveBeenCalled();
  });
});
