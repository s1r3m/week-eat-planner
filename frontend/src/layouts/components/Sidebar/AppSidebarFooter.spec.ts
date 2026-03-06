import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import AppSidebarFooter from './AppSidebarFooter.vue';
import { useAuthStore, UserIdentity } from '@/features/auth';
import { useSidebar } from '@/components/ui/sidebar';

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(),
  SidebarMenu: { template: '<div><slot /></div>' },
  SidebarMenuItem: { template: '<div><slot /></div>' },
  SidebarMenuButton: { template: '<div><slot /></div>' },
}));

vi.mock('@/features/auth/composables/useAsyncCall', () => ({
  useAsyncCall: vi.fn((fn) => ({ call: fn })),
}));

describe('AppSidebarFooter', () => {
  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

  const mountComponent = (initialState = {}) => {
    return mount(AppSidebarFooter, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              'auth-store': {
                user: mockUser,
                ...initialState,
              },
            },
          }),
        ],
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
    // In the template: <DropdownMenuTrigger v-if="authStore.user" as-child>
    // Since DropdownMenuTrigger is stubbed, we can check for its presence
    expect(wrapper.find('dropdown-menu-trigger-stub').exists()).toBeFalsy();
  });

  it('calls logout when Log Out is clicked', async () => {
    vi.mocked(useSidebar).mockReturnValue({
      isMobile: { value: false },
      setOpenMobile: vi.fn(),
    } as any);
    const wrapper = mountComponent();
    const authStore = useAuthStore();

    const logoutLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text().includes('Log Out'));
    expect(logoutLink).toBeDefined();

    await logoutLink!.trigger('click');
    expect(authStore.logout).toHaveBeenCalled();
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
