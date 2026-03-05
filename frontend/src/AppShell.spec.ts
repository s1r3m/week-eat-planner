import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h, Suspense } from 'vue';
import AppShell from './AppShell.vue';
import { useAuthStore } from '@/features/auth/store/auth';

vi.mock('@/features/auth/store/auth', () => ({
  useAuthStore: vi.fn() as any,
}));

describe('AppShell', () => {
  let mockAuthStore: {
    init: ReturnType<typeof vi.fn>;
  };

  const TestAppShell = defineComponent({
    render() {
      return h(Suspense, null, {
        default: () => h(AppShell),
        fallback: () => h('div', { class: 'loading' }, 'Loading...'),
      });
    },
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    mockAuthStore = {
      init: vi.fn().mockResolvedValue(undefined),
    };
    (useAuthStore as any).mockReturnValue(mockAuthStore);
    vi.clearAllMocks();
  });

  it('renders RouterView after init', async () => {
    const wrapper = mount(TestAppShell, {
      global: {
        stubs: {
          RouterView: { template: '<div class="router-view">Router View</div>' },
        },
      },
    });

    await flushPromises();

    expect(mockAuthStore.init).toHaveBeenCalled();
    expect(wrapper.find('.router-view').exists()).toBe(true);
  });

  it('does not render RouterView before init', () => {
    const wrapper = mount(TestAppShell, {
      global: {
        stubs: {
          RouterView: { template: '<div class="router-view">Router View</div>' },
        },
      },
    });

    expect(wrapper.find('.router-view').exists()).toBe(false);
    expect(wrapper.find('.loading').exists()).toBe(true);
  });

  it('renders RouterView even if authStore.init throws an error', async () => {
    mockAuthStore.init.mockRejectedValueOnce(new Error('Init failed'));
    const wrapper = mount(TestAppShell, {
      global: {
        stubs: {
          RouterView: { template: '<div class="router-view">Router View</div>' },
        },
      },
    });

    await flushPromises();

    expect(wrapper.find('.router-view').exists()).toBe(true);
  });
});
