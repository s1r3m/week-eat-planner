import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import WeekEditDialog from './WeekEditDialog.vue';
import WeekFormDialog from './WeekFormDialog.vue';
import { useWeekStore } from '../store/weeks';
import { ref } from 'vue';

// Mock useAsyncCall
vi.mock('@/features/auth/composables/useAsyncCall', () => ({
  useAsyncCall: vi.fn((task) => {
    const isLoading = ref(false);
    const call = async (...args: any[]) => {
      isLoading.value = true;
      try {
        return await task(...args);
      } finally {
        isLoading.value = false;
      }
    };
    return { call, isLoading };
  }),
}));

describe('WeekEditDialog', () => {
  const mockWeek = { id: 'week_1', name: 'Week 1', user_id: 'user_1' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders WeekFormDialog with correct props', () => {
    const wrapper = mount(WeekEditDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        week: mockWeek,
        modelValue: true,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);
    expect(formDialog.exists()).toBe(true);
    expect(formDialog.props('title')).toBe(`Edit ${mockWeek.name}`);
    expect(formDialog.props('initialName')).toBe(mockWeek.name);
    expect(formDialog.props('submitLabel')).toBe('Save');
    expect(formDialog.props('isLoading')).toBe(false);
  });

  it('calls updateWeek and closes dialog on submit', async () => {
    const wrapper = mount(WeekEditDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        week: mockWeek,
        modelValue: true,
      },
    });

    const weekStore = useWeekStore();
    const formDialog = wrapper.findComponent(WeekFormDialog);

    await formDialog.vm.$emit('submit', 'Updated Week Name');
    await flushPromises();

    expect(weekStore.updateWeek).toHaveBeenCalledWith(mockWeek.id, 'Updated Week Name');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.some((e) => e[0] === false)).toBe(true);
  });

  it('passes isLoading state to WeekFormDialog', async () => {
    let resolveUpdate: (value: void | PromiseLike<void>) => void;
    const updatePromise = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });

    const wrapper = mount(WeekEditDialog, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
          }),
        ],
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        week: mockWeek,
        modelValue: true,
      },
    });

    const weekStore = useWeekStore();
    weekStore.updateWeek = vi.fn().mockReturnValue(updatePromise);

    const formDialog = wrapper.findComponent(WeekFormDialog);
    formDialog.vm.$emit('submit', 'Updated Week Name');

    await wrapper.vm.$nextTick();
    expect(formDialog.props('isLoading')).toBe(true);

    resolveUpdate!();
    await flushPromises();
    expect(formDialog.props('isLoading')).toBe(false);
  });

  it('updates modelValue when WeekFormDialog emits update:modelValue', async () => {
    const wrapper = mount(WeekEditDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        week: mockWeek,
        modelValue: true,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);
    await formDialog.vm.$emit('update:modelValue', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });
});
