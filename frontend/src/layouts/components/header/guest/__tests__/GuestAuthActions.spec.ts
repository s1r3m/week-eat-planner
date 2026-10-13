import { ref, nextTick } from 'vue';
import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import GuestAuthActions from '../GuestAuthActions.vue';
import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';
import { isAuthenticated } from '@/api/auth';
import { useMutation } from '@pinia/colada';

vi.mock('@/features/auth/composables/useGuestAuthActions', () => ({
  useGuestAuthActions: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  isAuthenticated: ref(false),
  logoutMutation: vi.fn(),
}));

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

describe('GuestAuthActions', () => {
  const mockLogout = vi.fn();

  const mockComposable = (options: {
    showLogin?: boolean;
    showSignup?: boolean;
    isLogged?: boolean;
    isLoading?: boolean;
  }) => {
    vi.mocked(useGuestAuthActions).mockReturnValue({
      showLogin: ref(options.showLogin ?? false),
      showSignup: ref(options.showSignup ?? false),
    } as any);

    (isAuthenticated as any).value = options.isLogged ?? false;

    vi.mocked(useMutation).mockReturnValue({
      mutate: mockLogout,
      isLoading: ref(options.isLoading ?? false),
    } as any);
  };

  const mountComponent = () =>
    mount(GuestAuthActions, {
      global: {
        plugins: [createTestingPinia()],
        stubs: { RouterLink: RouterLinkStub },
      },
    });

  describe('guest state', () => {
    it('renders nothing when all flags are false', () => {
      mockComposable({});
      const wrapper = mountComponent();
      expect(wrapper.findAllComponents(RouterLinkStub)).toHaveLength(0);
      expect(wrapper.text()).not.toContain('Login');
      expect(wrapper.text()).not.toContain('Sign Up');
      expect(wrapper.text()).not.toContain('Log Out');
    });

    it('renders both login and signup links', () => {
      mockComposable({ showLogin: true, showSignup: true });
      const wrapper = mountComponent();
      const links = wrapper.findAllComponents(RouterLinkStub);
      expect(links).toHaveLength(2);
      expect(links[0].props('to')).toEqual({ name: 'login' });
      expect(links[1].props('to')).toEqual({ name: 'signup' });
    });

    it('renders only the login link when showSignup is false', () => {
      mockComposable({ showLogin: true, showSignup: false });
      const links = mountComponent().findAllComponents(RouterLinkStub);
      expect(links).toHaveLength(1);
      expect(links[0].props('to')).toEqual({ name: 'login' });
    });

    it('renders only the signup link when showLogin is false', () => {
      mockComposable({ showLogin: false, showSignup: true });
      const links = mountComponent().findAllComponents(RouterLinkStub);
      expect(links).toHaveLength(1);
      expect(links[0].props('to')).toEqual({ name: 'signup' });
    });
  });

  describe('authenticated state', () => {
    it('renders logout button and hides login/signup when logged in', () => {
      mockComposable({ isLogged: true });
      const wrapper = mountComponent();
      expect(wrapper.findAllComponents(RouterLinkStub)).toHaveLength(0);
      expect(wrapper.text()).toContain('Log Out');
      expect(wrapper.text()).not.toContain('Login');
      expect(wrapper.text()).not.toContain('Sign Up');
    });

    it('hides login and signup even when showLogin/showSignup are true if logged in', () => {
      mockComposable({ isLogged: true, showLogin: true, showSignup: true });
      const wrapper = mountComponent();
      expect(wrapper.findAllComponents(RouterLinkStub)).toHaveLength(0);
      expect(wrapper.text()).toContain('Log Out');
    });

    it('calls logout when the Log Out button is clicked', async () => {
      mockComposable({ isLogged: true });
      const wrapper = mountComponent();
      await wrapper.find('[data-slot="button"]').trigger('click');
      expect(mockLogout).toHaveBeenCalledOnce();
    });

    it('shows loading text while logout is in progress', async () => {
      const isLoading = ref(false);
      vi.mocked(useGuestAuthActions).mockReturnValue({
        showLogin: ref(false),
        showSignup: ref(false),
      } as any);
      (isAuthenticated as any).value = true;
      vi.mocked(useMutation).mockReturnValue({ mutate: mockLogout, isLoading } as any);

      const wrapper = mountComponent();
      expect(wrapper.text()).toContain('Log Out');

      isLoading.value = true;
      await nextTick();
      expect(wrapper.text()).toContain('Logging Out...');

      isLoading.value = false;
      await nextTick();
      expect(wrapper.text()).toContain('Log Out');
    });
  });
});
