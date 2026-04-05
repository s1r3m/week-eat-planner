import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import AppSidebarNavigation from '../AppSidebarNavigation.vue';
import AppSidebarNavigationItem from '../AppSidebarNavigationItem.vue';
import { ChevronRight } from 'lucide-vue-next';
import type { NavLink } from '@/layouts/components/header/types/navigation';
import { ref } from 'vue';

const mockWeeksData = ref<any[]>([]);

vi.mock('@pinia/colada', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pinia/colada')>();
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: mockWeeksData,
      isLoading: ref<boolean>(false),
    })),
  };
});

describe('AppSidebarNavigation', () => {
  beforeEach(() => {
    mockWeeksData.value = [
      { id: '1', name: 'Week 1' },
      { id: '2', name: 'Week 2' },
    ];
  });
  const mountComponent = () => {
    return mount(AppSidebarNavigation, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
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
        },
      },
    });
  };

  it('renders navigation links and sub-links based on week store', () => {
    const wrapper = mountComponent();
    const items = wrapper.findAllComponents(AppSidebarNavigationItem);

    // 2 main items (My weeks, Recipes)
    // + 2 dynamic week items
    // + 2 static recipe sub-items
    // Total = 6
    expect(items.length).toBe(6);

    const firstItem = items[0].props('item') as NavLink;
    expect(firstItem.label).toBe('My weeks');
    expect(firstItem.items!.length).toBe(2);
    expect(firstItem.items![0].label).toBe('Week 1');
  });

  it('renders ChevronRight when sub-items exist', () => {
    const wrapper = mountComponent();
    // Both "My weeks" and "Recipes" have sub-items in initial state
    const chevrons = wrapper.findAllComponents(ChevronRight);
    expect(chevrons.length).toBe(2);
  });

  it('handles empty weeks from store', () => {
    mockWeeksData.value = [];
    const wrapper = mount(AppSidebarNavigation, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
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
        },
      },
    });

    const items = wrapper.findAllComponents(AppSidebarNavigationItem);
    // 2 main items + 0 week sub-items + 2 recipe sub-items = 4
    expect(items.length).toBe(4);

    const firstItem = items[0].props('item') as NavLink;
    expect(firstItem.label).toBe('My weeks');
    expect(firstItem.items!.length).toBe(0);

    // Check if only 1 chevron is rendered (for Recipes)
    const chevrons = wrapper.findAllComponents(ChevronRight);
    expect(chevrons.length).toBe(1);
  });
});
