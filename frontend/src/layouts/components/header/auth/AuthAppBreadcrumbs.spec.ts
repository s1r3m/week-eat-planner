import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router';
import { useRoute } from 'vue-router';
import AuthAppBreadcrumbs from './AuthAppBreadcrumbs.vue';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: vi.fn(),
  };
});

describe('AuthAppBreadcrumbs', () => {
  const createMockRoute = (
    matched: Array<{ meta: { breadcrumbs?: any } }> = [],
  ): RouteLocationNormalizedLoadedGeneric => ({
    path: '/',
    name: 'Home',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: matched as any,
    meta: {},
    redirectedFrom: undefined,
  });

  const mountComponent = (route: RouteLocationNormalizedLoadedGeneric) => {
    vi.mocked(useRoute).mockReturnValue(route);
    return mount(AuthAppBreadcrumbs, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
        components: {
          Breadcrumb,
          BreadcrumbList,
          BreadcrumbItem,
          BreadcrumbPage,
          BreadcrumbSeparator,
        },
      },
    });
  };

  describe('Rendering', () => {
    it('renders the component', () => {
      const route = createMockRoute();
      const wrapper = mountComponent(route);

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(Breadcrumb).exists()).toBe(true);
    });

    it('renders BreadcrumbList', () => {
      const route = createMockRoute();
      const wrapper = mountComponent(route);

      expect(wrapper.findComponent(BreadcrumbList).exists()).toBe(true);
    });
  });

  describe('Home breadcrumb fallback', () => {
    it('shows only Home when route has less than 2 matched items', () => {
      const route = createMockRoute([]);
      const wrapper = mountComponent(route);

      const items = wrapper.findAllComponents(BreadcrumbItem);
      expect(items).toHaveLength(1);
      expect(items[0].text()).toContain('Home');
    });

    it('shows only Home when route has only 1 matched item', () => {
      const route = createMockRoute([{ meta: {} }]);
      const wrapper = mountComponent(route);

      const items = wrapper.findAllComponents(BreadcrumbItem);
      expect(items).toHaveLength(1);
      expect(items[0].text()).toContain('Home');
    });
  });

  describe('Breadcrumb items from route meta', () => {
    it('displays breadcrumbs from route meta as array', () => {
      const breadcrumbs = [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Settings', to: '/settings' },
      ];
      const route = createMockRoute([{ meta: {} }, { meta: { breadcrumbs } }]);
      const wrapper = mountComponent(route);

      const items = wrapper.findAllComponents(BreadcrumbItem);
      expect(items).toHaveLength(2);
      expect(items[0].text()).toContain('Dashboard');
      expect(items[1].text()).toContain('Settings');
    });

    it('displays breadcrumbs when meta.breadcrumbs is a function', () => {
      const breadcrumbsFn = (route: any) => [
        { label: 'Recipes', to: '/recipes' },
        { label: route.params.id },
      ];
      const route = createMockRoute([{ meta: {} }, { meta: { breadcrumbs: breadcrumbsFn } }]);
      const wrapper = mountComponent(route);

      const items = wrapper.findAllComponents(BreadcrumbItem);
      expect(items).toHaveLength(2);
      expect(items[0].text()).toContain('Recipes');
    });
  });

  describe('Router links', () => {
    it('renders router-link for items with to property', () => {
      const breadcrumbs = [
        { label: 'Home', to: '/' },
        { label: 'Dashboard', to: '/dashboard' },
      ];
      const route = createMockRoute([{ meta: {} }, { meta: { breadcrumbs } }]);
      const wrapper = mountComponent(route);

      const routerLinks = wrapper.findAllComponents(RouterLinkStub);
      expect(routerLinks).toHaveLength(2);
      expect(routerLinks[0].props('to')).toBe('/');
      expect(routerLinks[1].props('to')).toBe('/dashboard');
    });

    it('displays correct label text in router-links', () => {
      const breadcrumbs = [
        { label: 'Meals', to: '/meals' },
        { label: 'Weekly Plan', to: '/weekly-plan' },
      ];
      const route = createMockRoute([{ meta: {} }, { meta: { breadcrumbs } }]);
      const wrapper = mountComponent(route);

      const routerLinks = wrapper.findAllComponents(RouterLinkStub);
      expect(routerLinks[0].text()).toContain('Meals');
      expect(routerLinks[1].text()).toContain('Weekly Plan');
    });
  });

  describe('Breadcrumb pages', () => {
    it('renders BreadcrumbPage for items without to property', () => {
      const breadcrumbs = [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Current Page' }];
      const route = createMockRoute([{ meta: {} }, { meta: { breadcrumbs } }]);
      const wrapper = mountComponent(route);

      const pages = wrapper.findAllComponents(BreadcrumbPage);
      expect(pages).toHaveLength(1);
      expect(pages[0].text()).toContain('Current Page');
    });

    it('displays Home as BreadcrumbPage when no to property', () => {
      const route = createMockRoute([]);
      const wrapper = mountComponent(route);

      const pages = wrapper.findAllComponents(BreadcrumbPage);
      expect(pages).toHaveLength(1);
      expect(pages[0].text()).toContain('Home');
    });

    it('renders mixed items with links and pages', () => {
      const breadcrumbs = [{ label: 'Parent', to: '/parent' }, { label: 'Current' }];
      const route = createMockRoute([{ meta: {} }, { meta: { breadcrumbs } }]);
      const wrapper = mountComponent(route);

      const routerLinks = wrapper.findAllComponents(RouterLinkStub);
      const pages = wrapper.findAllComponents(BreadcrumbPage);

      expect(routerLinks).toHaveLength(1);
      expect(pages).toHaveLength(1);
    });
  });

  describe('Separators', () => {
    it('renders separators between breadcrumb items', () => {
      const breadcrumbs = [
        { label: 'First', to: '/' },
        { label: 'Second', to: '/second' },
        { label: 'Third' },
      ];
      const route = createMockRoute([{ meta: {} }, { meta: { breadcrumbs } }]);
      const wrapper = mountComponent(route);

      const separators = wrapper.findAllComponents(BreadcrumbSeparator);
      expect(separators).toHaveLength(2);
    });

    it('renders one less separator than breadcrumb items', () => {
      const breadcrumbs = [
        { label: 'First', to: '/' },
        { label: 'Second', to: '/second' },
      ];
      const route = createMockRoute([{ meta: {} }, { meta: { breadcrumbs } }]);
      const wrapper = mountComponent(route);

      const items = wrapper.findAllComponents(BreadcrumbItem);
      const separators = wrapper.findAllComponents(BreadcrumbSeparator);

      expect(separators).toHaveLength(items.length - 1);
    });

    it('renders no separators for single breadcrumb item', () => {
      const route = createMockRoute([]);
      const wrapper = mountComponent(route);

      const separators = wrapper.findAllComponents(BreadcrumbSeparator);
      expect(separators).toHaveLength(0);
    });
  });
});
