import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import WeekDeleteDialog from './WeekDeleteDialog.vue';
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

describe('WeekDeleteDialog', () => {
  const mockWeek = { id: 'week_id', name: 'Week 1', user_id: 'user_id' };

  const stubs = {
    Dialog: {
      template: '<div><slot /></div>',
      props: ['open'],
      emits: ['update:open'],
    },
    DialogContent: { template: '<div><slot /></div>' },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
    DialogDescription: { template: '<div><slot /></div>' },
    DialogFooter: { template: '<div><slot /></div>' },
    DialogClose: { template: '<div><slot /></div>' },
    Spinner: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with week name', () => {
    const wrapper = mount(WeekDeleteDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs,
      },
      props: {
        modelValue: mockWeek,
      },
    });

    expect(wrapper.text()).toContain('Delete Week 1?');
    expect(wrapper.text()).toContain('Are you sure you want to delete Week 1?');
  });

  it('updates modelValue when Dialog emits update:open', async () => {
    const wrapper = mount(WeekDeleteDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs,
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const dialog = wrapper.getComponent(stubs.Dialog);
    await dialog.vm.$emit('update:open', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
  });

  it('closes dialog when No button is clicked', async () => {
    const wrapper = mount(WeekDeleteDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs,
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const noButton = wrapper.findAll('button').find((b) => b.text() === 'No');
    await noButton?.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
  });

  it('calls removeWeek and closes dialog when Yes button is clicked', async () => {
    const wrapper = mount(WeekDeleteDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs,
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const weekStore = useWeekStore();
    const yesButton = wrapper.findAll('button').find((b) => b.text() === 'Yes');
    await yesButton?.trigger('click');
    await flushPromises();

    expect(weekStore.removeWeek).toHaveBeenCalledWith(mockWeek.id);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.some((e) => e[0] === null)).toBe(true);
  });

  it('shows loading state and disables button during deletion', async () => {
    let resolveDelete: (value: void | PromiseLike<void>) => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });

    const wrapper = mount(WeekDeleteDialog, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
          }),
        ],
        stubs: {
          ...stubs,
          Spinner: { template: '<div class="spinner"></div>' },
        },
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const weekStore = useWeekStore();
    weekStore.removeWeek = vi.fn().mockReturnValue(deletePromise);

    const yesButton = wrapper.findAll('button').find((b) => b.text() === 'Yes');
    await yesButton?.trigger('click');

    // Wait for next tick for isLoading to update
    await wrapper.vm.$nextTick();

    const loadingButton = wrapper
      .findAll<HTMLButtonElement>('button')
      .find((b) => b.text() === 'Deleting...');
    expect(loadingButton?.exists()).toBe(true);
    expect(loadingButton?.element.disabled).toBe(true);
    expect(wrapper.find('.spinner').exists()).toBe(true);

    resolveDelete!();
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')!.some((e) => e[0] === null)).toBe(true);
  });
});
