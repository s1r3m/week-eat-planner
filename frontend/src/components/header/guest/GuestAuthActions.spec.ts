import { describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { vi, type Mock } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';
import { useAuthStore } from '@/features/auth/store/auth';
import { useRoute } from 'vue-router';
import GuestAuthActions from './GuestAuthActions.vue';

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRoute: vi.fn(),
  };
});

describe('GuestAuthActions', () => {
  const mountComponent = (isAuthenticated: boolean, name: string) => {
    const testPinia = createTestingPinia({ stubActions: false });
    setActivePinia(testPinia);
    const authStore = useAuthStore();
    authStore.setAccessToken(isAuthenticated ? 'valid-token' : null);
    authStore.logout = vi.fn();
    (useRoute as Mock).mockReturnValue({ name });

    return mount(GuestAuthActions, {
      global: {
        plugins: [testPinia],
        stubs: {
          RouterLink: RouterLinkStub,
          Button: { template: '<button><slot /></button>' },
        },
      },
    });
  };

  it('renders login and signup when no auth on promo', () => {
    const wrapper = mountComponent(false, 'promo');
    const buttons = wrapper.findAllComponents(RouterLinkStub);

    expect(buttons).toHaveLength(2);
    expect(buttons[0].props().to).toEqual({ name: 'login' });
    expect(buttons[1].props().to).toEqual({ name: 'signup' });
    expect(wrapper.text()).not.toContain('Logout');
  });

  it('renders signup only on /login', () => {
    const wrapper = mountComponent(false, 'login');
    const buttons = wrapper.findAllComponents(RouterLinkStub);

    expect(buttons).toHaveLength(1);
    expect(buttons[0].props().to).toEqual({ name: 'signup' });
    expect(wrapper.text()).not.toContain('Login');
    expect(wrapper.text()).not.toContain('Logout');
  });

  it('renders login only on /signup', () => {
    const wrapper = mountComponent(false, 'signup');
    const buttons = wrapper.findAllComponents(RouterLinkStub);

    expect(buttons).toHaveLength(1);
    expect(buttons[0].props().to).toEqual({ name: 'login' });
    expect(wrapper.text()).not.toContain('Signup');
    expect(wrapper.text()).not.toContain('Logout');
  });

  it('renders Logout when authenticated', () => {
    const wrapper = mountComponent(true, 'promo');
    const buttons = wrapper.findAllComponents(RouterLinkStub);

    expect(buttons).toHaveLength(0);
    expect(wrapper.text()).toContain('Logout');
  });

  it('calls authStore.logout() when Logout is clicked', async () => {
    const wrpaper = mountComponent(true, 'promo');
    const button = wrpaper.find('button');

    await button.trigger('click');

    const authStore = useAuthStore();
    expect(authStore.logout).toHaveBeenCalledOnce();
  });
});
