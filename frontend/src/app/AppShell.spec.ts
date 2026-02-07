import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AppShell from './AppShell.vue';
import { useAuthStore } from '@/features/auth/store/auth';

vi.mock('@/features/auth/store/auth', () => ({
  useAuthStore: vi.fn() as any,
}));

describe('AppShell', () => {
  let mockAuthStore: {
    init: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    mockAuthStore = {
      init: vi.fn().mockResolvedValue(undefined),
    };
    (useAuthStore as any).mockReturnValue(mockAuthStore);
    vi.clearAllMocks();
  });

  it('has isReady false at the start', () => {
    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          RouterView: { template: '<div>Router View</div>' },
        },
      },
    }) as VueWrapper<{ isReady: boolean }>;

    expect(wrapper.vm.isReady).toBe(false);
  });

  it('renders RouterView after init', async () => {
    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          RouterView: { template: '<div class="router-view">Router View</div>' },
        },
      },
    }) as VueWrapper<{ isReady: boolean }>;

    await flushPromises();

    expect(mockAuthStore.init).toHaveBeenCalled();
    expect(wrapper.vm.isReady).toBe(true);
    expect(wrapper.find('.router-view').exists()).toBe(true);
  });

  it('does not render RouterView before init', () => {
    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          RouterView: { template: '<div class="router-view">Router View</div>' },
        },
      },
    }) as VueWrapper<{ isReady: boolean }>;

    expect(wrapper.find('.router-view').exists()).toBe(false);
  });

  it('renders RouterView even if authStore.init throws an error', async () => {
    mockAuthStore.init.mockRejectedValueOnce(new Error('Init failed'));
    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          RouterView: { template: '<div class="router-view">Router View</div>' },
        },
      },
    }) as VueWrapper<{ isReady: boolean }>;

    await flushPromises();

    expect(wrapper.vm.isReady).toBe(true);
    expect(wrapper.find('.router-view').exists()).toBe(true);
  });
});
