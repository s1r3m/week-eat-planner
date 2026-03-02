import { ref } from 'vue';
import { describe, it, expect, beforeEach } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { vi, type Mock } from 'vitest';
import GuestAuthActions from './GuestAuthActions.vue';

const logoutHandler = vi.fn();

vi.mock('@/features/auth/composables/useGuestAuthActions', () => ({
  useGuestAuthActions: vi.fn(),
}));

import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';

describe('GuestAuthActions', () => {
  const mockComposable = (options: {
    showLogin?: boolean;
    showSignup?: boolean;
    isLogged?: boolean;
  }) => {
    (useGuestAuthActions as unknown as Mock).mockReturnValue({
      showLogin: ref(options.showLogin ?? false),
      showSignup: ref(options.showSignup ?? false),
      isLogged: ref(options.isLogged ?? false),
      logoutHandler,
    });
  };

  const mountComponent = () =>
    mount(GuestAuthActions, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          Button: {
            props: ['variant', 'size', 'asChild'],
            emits: ['click'],
            template: `
            <button @click="$emit('click')">
              <slot />
            </button>
          `,
          },
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
      expect(wrapper.text()).not.toContain('Logout');
    });

    it('renders login and signup buttons', () => {
      mockComposable({
        showLogin: true,
        showSignup: true,
      });
      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);

      expect(buttons).toHaveLength(2);
      expect(buttons[0].props().to).toEqual({ name: 'login' });
      expect(buttons[1].props().to).toEqual({ name: 'signup' });
      expect(wrapper.text()).not.toContain('Logout');
    });

    it('renders only login (signup false branch)', () => {
      mockComposable({
        isLogged: false,
        showLogin: true,
        showSignup: false,
      });

      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);

      expect(buttons).toHaveLength(1);
      expect(buttons[0].props().to).toEqual({ name: 'login' });
    });

    it('renders only signup (login false branch)', () => {
      mockComposable({
        isLogged: false,
        showLogin: false,
        showSignup: true,
      });

      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);

      expect(buttons).toHaveLength(1);
      expect(buttons[0].props().to).toEqual({ name: 'signup' });
    });

    it('renders logout when logged in', () => {
      mockComposable({ isLogged: true });
      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);

      expect(buttons).toHaveLength(0); // No login and signup
      expect(wrapper.text()).not.toContain('Login');
      expect(wrapper.text()).not.toContain('Sign Up');
    });

    it('does not render login and signup when logged in even when showSignup, showLogin are true', () => {
      mockComposable({ isLogged: true, showSignup: true, showLogin: true });
      const wrapper = mountComponent();
      const buttons = wrapper.findAllComponents(RouterLinkStub);

      expect(buttons).toHaveLength(0); // No login and signup
      expect(wrapper.text()).not.toContain('Login');
      expect(wrapper.text()).not.toContain('Sign Up');
      expect(wrapper.text()).toContain('Logout');
    });
  });

  describe('Button clicks', () => {
    beforeEach(() => {
      logoutHandler.mockClear();
    });

    it('calls logoutHandler when Logout is clicked', async () => {
      mockComposable({ isLogged: true });
      const wrapper = mountComponent();
      const button = wrapper.find('button');

      await button.trigger('click');

      expect(logoutHandler).toHaveBeenCalledOnce();
    });
  });
});
