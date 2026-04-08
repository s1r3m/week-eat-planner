import { ref, nextTick } from 'vue';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import GuestAuthActions from '../GuestAuthActions.vue';
import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';
import { isAuthenticated, logoutMutation } from '@/api/auth';
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

const mockLogout = vi.fn();

describe('GuestAuthActions', () => {
  const mockComposable = (options: {
    showLogin?: boolean;
    showSignup?: boolean;
    isLogged?: boolean;
    isLoading?: boolean;
  }) => {
    (useGuestAuthActions as unknown as Mock).mockReturnValue({
      showLogin: ref(options.showLogin ?? false),
      showSignup: ref(options.showSignup ?? false),
    });

    (isAuthenticated as any).value = options.isLogged ?? false;

    (useMutation as unknown as Mock).mockReturnValue({
      mutate: mockLogout,
      isLoading: ref(options.isLoading ?? false),
    });
  };

  const mountComponent = () =>
    mount(GuestAuthActions, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          RouterLink: RouterLinkStub,
          Button: {
            emits: ['click'],
            template: `<button @click="$emit('click')"><slot /></button>`,
          },
          Spinner: { template: '<div class="spinner" />' },
        },
      },
    });

  describe('Rendering', () => {
    it('renders nothing when all flags are false', () => {
      mockComposable({});
      const wrapper = mountComponent();
      const links = wrapper.findAllComponents(RouterLinkStub);
      expect(links).toHaveLength(0);
      expect(wrapper.text()).not.toContain('Login');
      expect(wrapper.text()).not.toContain('Sign Up');
      expect(wrapper.text()).not.toContain('Log Out');
    });

    it('renders login and signup buttons', () => {
      mockComposable({ showLogin: true, showSignup: true });
      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);
      expect(buttons).toHaveLength(2);
      expect(buttons[0].props().to).toEqual({ name: 'login' });
      expect(buttons[1].props().to).toEqual({ name: 'signup' });
      expect(wrapper.text()).not.toContain('Log Out');
    });

    it('renders only login (signup false branch)', () => {
      mockComposable({ isLogged: false, showLogin: true, showSignup: false });
      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].props().to).toEqual({ name: 'login' });
    });

    it('renders only signup (login false branch)', () => {
      mockComposable({ isLogged: false, showLogin: false, showSignup: true });
      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].props().to).toEqual({ name: 'signup' });
    });

    it('renders logout when logged in', () => {
      mockComposable({ isLogged: true });
      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);
      expect(buttons).toHaveLength(0);
      expect(wrapper.text()).not.toContain('Login');
      expect(wrapper.text()).not.toContain('Sign Up');
      expect(wrapper.text()).toContain('Log Out');
    });

    it('does not render login and signup when logged in even when showSignup, showLogin are true', () => {
      mockComposable({ isLogged: true, showSignup: true, showLogin: true });
      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);
      expect(buttons).toHaveLength(0);
      expect(wrapper.text()).not.toContain('Login');
      expect(wrapper.text()).not.toContain('Sign Up');
      expect(wrapper.text()).toContain('Log Out');
    });

    it('reacts to isLoading changes dynamically', async () => {
      const isLoading = ref(false);
      (useGuestAuthActions as unknown as Mock).mockReturnValue({
        showLogin: ref(false),
        showSignup: ref(false),
      });
      (isAuthenticated as any).value = true;
      (useMutation as unknown as Mock).mockReturnValue({
        mutate: mockLogout,
        isLoading,
      });

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

  describe('Button clicks', () => {
    beforeEach(() => {
      mockLogout.mockClear();
    });

    it('calls logoutHandler when Logout is clicked', async () => {
      mockComposable({ isLogged: true });
      const wrapper = mountComponent();
      const button = wrapper.find('button');
      await button.trigger('click');
      expect(mockLogout).toHaveBeenCalledOnce();
    });
  });
});
