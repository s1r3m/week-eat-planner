import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import AppSidebarNavigation from '../AppSidebarNavigation.vue';
import AppSidebarNavigationItem from '../AppSidebarNavigationItem.vue';
import { ChevronRight, Loader2 } from 'lucide-vue-next';
import type { NavLink } from '@/layouts/components/header/types/navigation';
import { ref } from 'vue';

const mockWeeksData = ref<any[]>([]);
const mockIsLoading = ref<boolean>(false);

vi.mock('@pinia/colada', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pinia/colada')>();
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: mockWeeksData,
      isLoading: mockIsLoading,
    })),
  };
});

describe('AppSidebarNavigation', () => {
  beforeEach(() => {
    mockWeeksData.value = [
      { id: '1', name: 'Week 1' },
      { id: '2', name: 'Week 2' },
    ];
    mockIsLoading.value = false;
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
    // Only "My weeks" has sub-items (weeks.length > 0)
    const chevrons = wrapper.findAllComponents(ChevronRight);
    expect(chevrons.length).toBe(1);
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
    // 2 main items + 0 week sub-items + 0 recipe sub-items = 2
    // My weeks, Recipes, My recipes, Favorites
    // Wait, the items are: [My weeks, Recipes, My recipes, Favorites]
    // My weeks has items: []
    // Recipes has items: []
    expect(items.length).toBe(4);

    const firstItem = items[0].props('item') as NavLink;
    expect(firstItem.label).toBe('My weeks');
    expect(firstItem.items!.length).toBe(0);

    // Check if 0 chevrons are rendered
    const chevrons = wrapper.findAllComponents(ChevronRight);
    expect(chevrons.length).toBe(0);
  });

  it('renders loader when isLoading is true', () => {
    mockIsLoading.value = true;
    const wrapper = mountComponent();

    expect(wrapper.findComponent(Loader2).exists()).toBe(true);
  });
});
