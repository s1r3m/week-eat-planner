import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { ref } from 'vue';
import AuthAppBreadcrumbs from '../AuthAppBreadcrumbs.vue';
import { useBreadcrumbs } from '@/layouts/composables/breadcrumbs';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

vi.mock('@/layouts/composables/breadcrumbs', () => ({
  useBreadcrumbs: vi.fn(),
}));

describe('AuthAppBreadcrumbs', () => {
  const breadcrumbsMock = ref<any[]>([]);

  beforeEach(() => {
    breadcrumbsMock.value = [];
    vi.mocked(useBreadcrumbs).mockReturnValue(breadcrumbsMock as any);
  });

  const mountComponent = () => {
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
      const wrapper = mountComponent();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(Breadcrumb).exists()).toBe(true);
    });

    it('renders BreadcrumbList', () => {
      const wrapper = mountComponent();

      expect(wrapper.findComponent(BreadcrumbList).exists()).toBe(true);
    });
  });

  describe('Breadcrumb items', () => {
    it('displays breadcrumbs from composable', () => {
      breadcrumbsMock.value = [
        { label: 'Dashboard', to: { name: 'dashboard' } },
        { label: 'Settings', to: { name: 'settings' } },
      ];
      const wrapper = mountComponent();

      const items = wrapper.findAllComponents(BreadcrumbItem);
      expect(items).toHaveLength(2);
      expect(items[0].text()).toContain('Dashboard');
      expect(items[1].text()).toContain('Settings');
    });

    it('renders router-link for items with to property', () => {
      breadcrumbsMock.value = [
        { label: 'Home', to: { name: 'home' } },
        { label: 'Dashboard', to: { name: 'dashboard' } },
      ];
      const wrapper = mountComponent();

      const routerLinks = wrapper.findAllComponents(RouterLinkStub);
      expect(routerLinks).toHaveLength(2);
      expect(routerLinks[0].props('to')).toEqual({ name: 'home' });
      expect(routerLinks[1].props('to')).toEqual({ name: 'dashboard' });
    });

    it('renders BreadcrumbPage for items without to property', () => {
      breadcrumbsMock.value = [
        { label: 'Dashboard', to: { name: 'dashboard' } },
        { label: 'Current Page' },
      ];
      const wrapper = mountComponent();

      const pages = wrapper.findAllComponents(BreadcrumbPage);
      expect(pages).toHaveLength(1);
      expect(pages[0].text()).toContain('Current Page');
    });

    it('renders separators between breadcrumb items', () => {
      breadcrumbsMock.value = [
        { label: 'First', to: { name: 'first' } },
        { label: 'Second', to: { name: 'second' } },
        { label: 'Third' },
      ];
      const wrapper = mountComponent();

      const separators = wrapper.findAllComponents(BreadcrumbSeparator);
      expect(separators).toHaveLength(2);
    });

    it('renders no separators for single breadcrumb item', () => {
      breadcrumbsMock.value = [{ label: 'Single' }];
      const wrapper = mountComponent();

      const separators = wrapper.findAllComponents(BreadcrumbSeparator);
      expect(separators).toHaveLength(0);
    });
  });
});
