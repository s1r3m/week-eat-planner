import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import GuestMobileMenu from '../GuestMobileMenu.vue';
import type { NavLink } from '../GuestNavigation.vue';

interface GuestMobileMenuInstance {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const mockFullPath = ref('/');

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      get fullPath() {
        return mockFullPath.value;
      },
      path: '/',
      name: 'home',
      params: {},
      query: {},
      hash: '',
      matched: [],
      meta: {},
      redirectedFrom: undefined,
    })),
  };
});

describe('GuestMobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFullPath.value = '/';
  });

  const mountComponent = (links: NavLink[]): VueWrapper<GuestMobileMenuInstance> => {
    return mount(GuestMobileMenu, {
      props: {
        links: links,
      },
      global: {
        stubs: {
          Button: {
            template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
            name: 'Button',
          },
          Menu: {
            template: '<svg class="menu-icon" data-testid="menu-icon"><slot /></svg>',
            name: 'Menu',
          },
          Sheet: {
            template: `<div class="sheet">
              <slot />
            </div>`,
            props: ['open'],
            emits: ['update:open'],
            name: 'Sheet',
          },
          SheetContent: {
            template: '<div class="sheet-content"><slot /></div>',
            props: ['side'],
            name: 'SheetContent',
          },
          SheetHeader: {
            template: '<div class="sheet-header"><slot /></div>',
            name: 'SheetHeader',
          },
          SheetFooter: {
            template: '<div class="sheet-footer"><slot /></div>',
            name: 'SheetFooter',
          },
          GuestNavigation: {
            template: '<div class="guest-navigation" />',
            props: ['links'],
            name: 'GuestNavigation',
          },
          AppBrand: {
            template: '<div class="app-brand" />',
            name: 'AppBrand',
          },
          GuestAuthActions: {
            template: '<div class="guest-auth-actions" />',
            name: 'GuestAuthActions',
          },
        },
      },
    }) as unknown as VueWrapper<GuestMobileMenuInstance>;
  };

  describe('State Management', () => {
    it('initializes with open as false', () => {
      const wrapper = mountComponent([]);
      expect(wrapper.vm.open).toBe(false);
    });

    it('flips open on toggle from false to true', async () => {
      const wrapper = mountComponent([]);
      expect(wrapper.vm.open).toBe(false);

      wrapper.vm.toggle();
      await nextTick();

      expect(wrapper.vm.open).toBe(true);
    });

    it('flips open on toggle from true to false', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.open = true;
      await nextTick();

      wrapper.vm.toggle();
      await nextTick();

      expect(wrapper.vm.open).toBe(false);
    });

    it('close() sets open to false', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.open = true;
      await nextTick();

      wrapper.vm.close();
      await nextTick();

      expect(wrapper.vm.open).toBe(false);
    });

    it('close() is idempotent when already false', async () => {
      const wrapper = mountComponent([]);
      expect(wrapper.vm.open).toBe(false);

      wrapper.vm.close();
      await nextTick();

      expect(wrapper.vm.open).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('button click calls toggle function', async () => {
      const wrapper = mountComponent([]);
      const button = wrapper.findComponent({ name: 'Button' });

      expect(wrapper.vm.open).toBe(false);

      await button.trigger('click');
      await nextTick();

      expect(wrapper.vm.open).toBe(true);
    });

    it('button has aria-controls attribute', () => {
      const wrapper = mountComponent([]);
      const button = wrapper.find('button');

      expect(button.attributes('aria-controls')).toBe('mobile-menu');
    });

    it('button has sr-only span for accessibility', () => {
      const wrapper = mountComponent([]);
      const srOnlyText = wrapper.text();

      expect(srOnlyText).toContain('Toggle mobile menu');
    });
  });

  describe('Sheet Component', () => {
    it('Sheet component receives v-model:open binding', () => {
      const wrapper = mountComponent([]);
      const sheet = wrapper.findComponent({ name: 'Sheet' });

      expect(sheet.exists()).toBe(true);
      expect(sheet.props('open')).toBe(false);
    });

    it('Sheet updates open ref when update:open is emitted', async () => {
      const wrapper = mountComponent([]);
      const sheet = wrapper.findComponent({ name: 'Sheet' });

      expect(wrapper.vm.open).toBe(false);

      await sheet.vm.$emit('update:open', true);
      await nextTick();

      expect(wrapper.vm.open).toBe(true);
    });

    it('SheetContent has side prop set to top', () => {
      const wrapper = mountComponent([]);
      const sheetContent = wrapper.findComponent({ name: 'SheetContent' });

      expect(sheetContent.props('side')).toBe('top');
    });
  });

  describe('Route Watcher', () => {
    it('closes menu when route fullPath changes', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.open = true;
      await nextTick();

      expect(wrapper.vm.open).toBe(true);

      mockFullPath.value = '/about';
      await nextTick();

      expect(wrapper.vm.open).toBe(false);
    });

    it('watcher responds to fullPath changes including query params', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.open = true;
      await nextTick();

      mockFullPath.value = '/weeks?week=5';
      await nextTick();

      expect(wrapper.vm.open).toBe(false);
    });

    it('does not close menu when already closed on route change', async () => {
      const wrapper = mountComponent([]);
      expect(wrapper.vm.open).toBe(false);

      mockFullPath.value = '/recipes';
      await nextTick();

      expect(wrapper.vm.open).toBe(false);
    });
  });

  describe('Props Forwarding', () => {
    it('passes links prop to GuestNavigation', () => {
      const links: NavLink[] = [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
      ];
      const wrapper = mountComponent(links);
      const guestNav = wrapper.findComponent({ name: 'GuestNavigation' });

      expect(guestNav.props('links')).toEqual(links);
    });

    it('handles empty links array', () => {
      const wrapper = mountComponent([]);
      const guestNav = wrapper.findComponent({ name: 'GuestNavigation' });

      expect(guestNav.props('links')).toEqual([]);
    });

    it('handles multiple navigation links', () => {
      const links: NavLink[] = [
        { label: 'Features', to: '/features' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Docs', to: '/docs' },
      ];
      const wrapper = mountComponent(links);
      const guestNav = wrapper.findComponent({ name: 'GuestNavigation' });

      expect(guestNav.props('links')).toEqual(links);
    });
  });

  describe('Component Structure', () => {
    it('renders Button component', () => {
      const wrapper = mountComponent([]);
      expect(wrapper.findComponent({ name: 'Button' }).exists()).toBe(true);
    });

    it('renders Sheet component', () => {
      const wrapper = mountComponent([]);
      expect(wrapper.findComponent({ name: 'Sheet' }).exists()).toBe(true);
    });

    it('renders SheetHeader with AppBrand', () => {
      const wrapper = mountComponent([]);
      const header = wrapper.findComponent({ name: 'SheetHeader' });
      const brand = wrapper.findComponent({ name: 'AppBrand' });

      expect(header.exists()).toBe(true);
      expect(brand.exists()).toBe(true);
    });

    it('renders GuestNavigation in sheet content', () => {
      const wrapper = mountComponent([]);
      expect(wrapper.findComponent({ name: 'GuestNavigation' }).exists()).toBe(true);
    });

    it('renders GuestAuthActions in SheetFooter', () => {
      const wrapper = mountComponent([]);
      const footer = wrapper.findComponent({ name: 'SheetFooter' });
      const authActions = wrapper.findComponent({ name: 'GuestAuthActions' });

      expect(footer.exists()).toBe(true);
      expect(authActions.exists()).toBe(true);
    });

    it('component has correct component hierarchy', () => {
      const wrapper = mountComponent([]);

      expect(wrapper.findComponent({ name: 'Button' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'Sheet' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'SheetContent' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'SheetHeader' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'SheetFooter' }).exists()).toBe(true);
    });
  });
});
