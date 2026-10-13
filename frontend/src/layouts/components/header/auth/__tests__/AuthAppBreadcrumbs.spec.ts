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

  const mountComponent = () =>
    mount(AuthAppBreadcrumbs, {
      global: {
        stubs: { RouterLink: RouterLinkStub },
        components: {
          Breadcrumb,
          BreadcrumbList,
          BreadcrumbItem,
          BreadcrumbPage,
          BreadcrumbSeparator,
        },
      },
    });

  it('renders the Breadcrumb and BreadcrumbList components', () => {
    const wrapper = mountComponent();
    expect(wrapper.findComponent(Breadcrumb).exists()).toBe(true);
    expect(wrapper.findComponent(BreadcrumbList).exists()).toBe(true);
  });

  it('renders a BreadcrumbItem for each breadcrumb', () => {
    breadcrumbsMock.value = [
      { label: 'Dashboard', to: { name: 'dashboard' } },
      { label: 'Settings', to: { name: 'settings' } },
    ];
    const items = mountComponent().findAllComponents(BreadcrumbItem);
    expect(items).toHaveLength(2);
    expect(items[0].text()).toContain('Dashboard');
    expect(items[1].text()).toContain('Settings');
  });

  it('renders router-links for items that have a to property', () => {
    breadcrumbsMock.value = [
      { label: 'Home', to: { name: 'home' } },
      { label: 'Dashboard', to: { name: 'dashboard' } },
    ];
    const links = mountComponent().findAllComponents(RouterLinkStub);
    expect(links).toHaveLength(2);
    expect(links[0].props('to')).toEqual({ name: 'home' });
    expect(links[1].props('to')).toEqual({ name: 'dashboard' });
  });

  it('renders BreadcrumbPage for items without a to property', () => {
    breadcrumbsMock.value = [
      { label: 'Dashboard', to: { name: 'dashboard' } },
      { label: 'Current Page' },
    ];
    const pages = mountComponent().findAllComponents(BreadcrumbPage);
    expect(pages).toHaveLength(1);
    expect(pages[0].text()).toContain('Current Page');
  });

  it('renders a separator between each pair of breadcrumb items', () => {
    breadcrumbsMock.value = [
      { label: 'First', to: { name: 'first' } },
      { label: 'Second', to: { name: 'second' } },
      { label: 'Third' },
    ];
    expect(mountComponent().findAllComponents(BreadcrumbSeparator)).toHaveLength(2);
  });

  it('renders no separators for a single breadcrumb item', () => {
    breadcrumbsMock.value = [{ label: 'Single' }];
    expect(mountComponent().findAllComponents(BreadcrumbSeparator)).toHaveLength(0);
  });
});
