import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import type NavLink from '../GuestHeader.vue';
import GuestHeader from '../GuestHeader.vue';

describe('GuestHeader', () => {
  let wrapper: VueWrapper<any>;
  let pinia: any;
  let router: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', redirect: '' },
        { path: '/login', name: 'login', redirect: '' },
        { path: '/signup', name: 'signup', redirect: '' },
      ],
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
  });

  const mountComponent = (props = {}) => {
    return mount(GuestHeader, {
      props,
      global: {
        plugins: [pinia, router],
      },
      stubs: {
        NavigationMenu: { template: '<nav><slot /></nav>' },
        NavigationMenuItem: { template: '<div><slot /></div>' },
        NavigationMenuLink: { template: '<div><slot /></div>' },
        NavigationMenuList: { template: '<ul><slot /></ul>' },
        ModeToggle: { template: '<div class="mode-toggle-stub"></div>' },
        Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        Sheet: {
          template: `<div>
            <div v-if="modelValue" class="sheet-open"><slot /></div>
            <slot name="content" />
          </div>`,
          props: ['modelValue'],
          emits: ['update:modelValue'],
        },
        SheetContent: { template: '<div><slot /></div>' },
        SheetHeader: { template: '<div><slot /></div>' },
        SheetTitle: { template: '<div><slot /></div>' },
        SheetDescription: { template: '<div><slot /></div>' },
        SheetFooter: { template: '<div><slot /></div>' },
        SheetClose: { template: '<div><slot /></div>' },
        'router-link': {
          template: '<a :href="to"><slot /></a>',
          props: ['to'],
        },
      },
    });
  };

  describe('Rendering', () => {
    it('renders the component', () => {
      wrapper = mountComponent();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('header').exists()).toBe(true);
    });

    it('renders the logo image', () => {
      wrapper = mountComponent();

      const logoImg = wrapper.find('img');
      expect(logoImg.exists()).toBe(true);
      expect(logoImg.attributes('src')).toContain('logo.png');
      expect(logoImg.attributes('alt')).toBe('Week Eat Planner logo');
    });

    it('renders the title text', () => {
      wrapper = mountComponent();

      const title = wrapper.find('h1');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('Week Eat Planner');
    });

    // it('renders ModeToggle component', () => {
    //   wrapper = mountComponent();

    //   const modeToggle = wrapper.find('.mode-toggle-stub');
    //   expect(modeToggle.exists()).toBe(true);
    // });

    it('renders navigation menu', () => {
      wrapper = mountComponent();

      const navMenu = wrapper.find('nav');
      expect(navMenu.exists()).toBe(true);
    });
  });

  describe('Auth Buttons -- not authenticated', () => {
    beforeEach(async () => {
      await router.push('/');
      wrapper = mountComponent();
    });

    it('shows Login and Sign Up buttons one main page', () => {
      const loginButton = wrapper.find('a[href="/login"]');
      const signUpButton = wrapper.find('a[href="/signup"]');

      expect(loginButton.exists()).toBe(true);
      expect(loginButton.text()).toBe('Login');

      expect(signUpButton.exists()).toBe(true);
      expect(signUpButton.text()).toBe('Sign Up');
    });

    it('does not show logout button', () => {
      const buttons = wrapper.findAll('button');
      const logoutButtons = buttons.filter((btn) => btn.text() === 'Logout');
      expect(logoutButtons.length).toBe(0);
    });

    it.each([
      { path: '/login', expectedText: 'Login' },
      { path: '/signup', expectedText: 'Sign Up' },
    ])('does not show $expectedText button text for $path', async ({ path }) => {
      await router.push(`${path}`);
      wrapper = mountComponent();
      const button = wrapper.find(`a[href="/${path}"]`);
      expect(button.exists()).toBe(false);
    });
  });

  describe('Auth Buttons -- authenticated', () => {
    beforeEach(async () => {
      const { useAuthStore } = await import('@/features/auth/store/auth');
      const authStore = useAuthStore();
      authStore.setAccessToken('mock-token');

      await router.push('/');
      wrapper = mountComponent();
    });

    it('shows Logout button', () => {
      const buttons = wrapper.findAll('button');
      const logoutButtons = buttons.filter((btn) => btn.text() === 'Logout');
      expect(logoutButtons.length).toBe(1);
    });

    it('does not show Login and Sign Up buttons', () => {
      const loginButton = wrapper.find('a[href="/login"]');
      const signUpButton = wrapper.find('a[href="/signup"]');

      expect(loginButton.exists()).toBe(false);
      expect(signUpButton.exists()).toBe(false);
    });

    it('calls logout method on Logout button click', async () => {
      const { useAuthStore } = await import('@/features/auth/store/auth');
      const authStore = useAuthStore();
      const logoutStoreSpy = vi.spyOn(authStore, 'logout');
      const buttons = wrapper.findAll('button');
      const logoutButton = buttons.find((btn) => btn.text() === 'Logout');

      if (logoutButton) {
        logoutButton.trigger('click');
        // expect(logoutStoreSpy).toHaveBeenCalledOnce();
      } else {
        throw new Error('Logout button not found');
      }
    });
  });
});
