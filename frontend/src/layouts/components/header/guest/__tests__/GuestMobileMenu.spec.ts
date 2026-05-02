import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import i18n from '@/i18n';
import GuestMobileMenu from '../GuestMobileMenu.vue';
import type { NavLink } from '@/layouts/components/header/types/navigation';

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

  const mountComponent = (links: NavLink[]): VueWrapper<GuestMobileMenuInstance> =>
    mount(GuestMobileMenu, {
      props: { links },
      global: {
        plugins: [i18n],
        stubs: {
          Button: {
            template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
            emits: ['click'],
            name: 'Button',
          },
          Menu: { template: '<svg class="menu-icon" />', name: 'Menu' },
          Sheet: {
            template: '<div class="sheet"><slot /></div>',
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
          SheetTitle: { template: '<div class="sheet-title"><slot /></div>', name: 'SheetTitle' },
          SheetDescription: {
            template: '<div class="sheet-description"><slot /></div>',
            name: 'SheetDescription',
          },
          GuestNavigation: {
            template: '<div class="guest-navigation" />',
            props: ['links'],
            name: 'GuestNavigation',
          },
          AppBrand: { template: '<div class="app-brand" />', name: 'AppBrand' },
          GuestAuthActions: {
            template: '<div class="guest-auth-actions" />',
            name: 'GuestAuthActions',
          },
        },
      },
    }) as unknown as VueWrapper<GuestMobileMenuInstance>;

  describe('open/close state', () => {
    it('initializes with open as false', () => {
      expect(mountComponent([]).vm.open).toBe(false);
    });

    it('toggle flips open from false to true', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.toggle();
      await nextTick();
      expect(wrapper.vm.open).toBe(true);
    });

    it('toggle flips open from true to false', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.open = true;
      await nextTick();
      wrapper.vm.toggle();
      await nextTick();
      expect(wrapper.vm.open).toBe(false);
    });

    it('close sets open to false', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.open = true;
      await nextTick();
      wrapper.vm.close();
      await nextTick();
      expect(wrapper.vm.open).toBe(false);
    });

    it('close is idempotent when already false', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.close();
      await nextTick();
      expect(wrapper.vm.open).toBe(false);
    });
  });

  describe('toggle button', () => {
    it('clicking the button calls toggle', async () => {
      const wrapper = mountComponent([]);
      await wrapper.findComponent({ name: 'Button' }).trigger('click');
      await nextTick();
      expect(wrapper.vm.open).toBe(true);
    });

    it('has aria-controls="mobile-menu"', () => {
      expect(mountComponent([]).find('button').attributes('aria-controls')).toBe('mobile-menu');
    });

    it('has a screen reader label', () => {
      expect(mountComponent([]).text()).toContain('Toggle mobile menu');
    });
  });

  describe('Sheet component', () => {
    it('receives the open value as a prop', () => {
      const sheet = mountComponent([]).findComponent({ name: 'Sheet' });
      expect(sheet.exists()).toBe(true);
      expect(sheet.props('open')).toBe(false);
    });

    it('updates open when Sheet emits update:open', async () => {
      const wrapper = mountComponent([]);
      await wrapper.findComponent({ name: 'Sheet' }).vm.$emit('update:open', true);
      await nextTick();
      expect(wrapper.vm.open).toBe(true);
    });

    it('SheetContent has side set to top', () => {
      expect(mountComponent([]).findComponent({ name: 'SheetContent' }).props('side')).toBe('top');
    });
  });

  describe('route watcher', () => {
    it('closes the menu when the route fullPath changes', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.open = true;
      await nextTick();
      mockFullPath.value = '/about';
      await nextTick();
      expect(wrapper.vm.open).toBe(false);
    });

    it('closes the menu on route changes with query params', async () => {
      const wrapper = mountComponent([]);
      wrapper.vm.open = true;
      await nextTick();
      mockFullPath.value = '/weeks?week=5';
      await nextTick();
      expect(wrapper.vm.open).toBe(false);
    });

    it('remains closed on route change when already closed', async () => {
      const wrapper = mountComponent([]);
      mockFullPath.value = '/recipes';
      await nextTick();
      expect(wrapper.vm.open).toBe(false);
    });
  });

  describe('props forwarding', () => {
    it('passes the links prop to GuestNavigation', () => {
      const links: NavLink[] = [
        { label: 'Home', to: { name: 'home' } },
        { label: 'About', to: { name: 'about' } },
      ];
      const nav = mountComponent(links).findComponent({ name: 'GuestNavigation' });
      expect(nav.props('links')).toEqual(links);
    });

    it('handles an empty links array', () => {
      expect(mountComponent([]).findComponent({ name: 'GuestNavigation' }).props('links')).toEqual(
        [],
      );
    });
  });

  describe('component structure', () => {
    it('renders Button, Sheet, SheetContent, SheetHeader and SheetFooter', () => {
      const wrapper = mountComponent([]);
      expect(wrapper.findComponent({ name: 'Button' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'Sheet' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'SheetContent' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'SheetHeader' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'SheetFooter' }).exists()).toBe(true);
    });

    it('renders AppBrand in SheetHeader', () => {
      expect(mountComponent([]).findComponent({ name: 'AppBrand' }).exists()).toBe(true);
    });

    it('renders GuestNavigation in sheet content', () => {
      expect(mountComponent([]).findComponent({ name: 'GuestNavigation' }).exists()).toBe(true);
    });

    it('renders GuestAuthActions in SheetFooter', () => {
      expect(mountComponent([]).findComponent({ name: 'GuestAuthActions' }).exists()).toBe(true);
    });
  });
});
