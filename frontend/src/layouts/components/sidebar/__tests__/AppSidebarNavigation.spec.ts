import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import AppSidebarNavigation from '../AppSidebarNavigation.vue';
import AppSidebarNavigationItem from '../AppSidebarNavigationItem.vue';
import { ChevronRight, Loader2 } from 'lucide-vue-next';
import type { NavLink } from '@/layouts/components/header/types/navigation';
import { ref } from 'vue';
import { useQuery } from '@pinia/colada';

const mockWeeksData = ref<any[]>([]);
const mockIsLoading = ref<boolean>(false);

vi.mock('@pinia/colada', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pinia/colada')>();
  return {
    ...actual,
    useQuery: vi.fn(() => ({ data: mockWeeksData, isLoading: mockIsLoading })),
  };
});

describe('AppSidebarNavigation', () => {
  const sidebarStubs = {
    AppSidebarNavigationItem: true,
    Collapsible: { template: '<div><slot /></div>' },
    CollapsibleContent: { template: '<div><slot /></div>' },
    CollapsibleTrigger: { template: '<div><slot /></div>' },
    SidebarGroup: { template: '<div><slot /></div>' },
    SidebarGroupLabel: { template: '<div><slot /></div>' },
    SidebarMenu: { template: '<div><slot /></div>' },
    SidebarMenuAction: { template: '<div><slot /></div>' },
    SidebarMenuItem: { template: '<div><slot /></div>' },
    SidebarMenuSub: { template: '<div><slot /></div>' },
    SidebarMenuSubItem: { template: '<div><slot /></div>' },
  };

  const mountComponent = () =>
    mount(AppSidebarNavigation, {
      global: { plugins: [createTestingPinia()], stubs: sidebarStubs },
    });

  beforeEach(() => {
    mockWeeksData.value = [
      { id: '1', name: 'Week 1' },
      { id: '2', name: 'Week 2' },
    ];
    mockIsLoading.value = false;
  });

  it('renders navigation items for main links plus dynamic week sub-items', () => {
    const items = mountComponent().findAllComponents(AppSidebarNavigationItem);
    expect(items.length).toBe(6);

    const firstItem = items[0].props('item') as NavLink;
    expect(firstItem.label).toBe('My weeks');
    expect(firstItem.items!.length).toBe(2);
    expect(firstItem.items![0].label).toBe('Week 1');
  });

  it('renders a ChevronRight when a section has sub-items', () => {
    expect(mountComponent().findAllComponents(ChevronRight).length).toBe(1);
  });

  it('renders 4 items and no chevrons when weeks are empty', () => {
    mockWeeksData.value = [];
    const wrapper = mountComponent();
    const items = wrapper.findAllComponents(AppSidebarNavigationItem);
    expect(items.length).toBe(4);

    const firstItem = items[0].props('item') as NavLink;
    expect(firstItem.label).toBe('My weeks');
    expect(firstItem.items!.length).toBe(0);
    expect(wrapper.findAllComponents(ChevronRight).length).toBe(0);
  });

  it('shows the loading spinner while weeks are loading', () => {
    mockIsLoading.value = true;
    expect(mountComponent().findComponent(Loader2).exists()).toBe(true);
  });
});
