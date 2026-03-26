import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import WeekCreateDialog from '../WeekCreateDialog.vue';
import WeekFormDialog from '../WeekFormDialog.vue';
import { useWeekStore } from '@/features/week/store/weeks';

describe('WeekCreateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders WeekFormDialog with correct props', () => {
    const wrapper = mount(WeekCreateDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: true,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);
    expect(formDialog.exists()).toBe(true);
    expect(formDialog.props('title')).toBe('Add new Week');
    expect(formDialog.props('description')).toBe('Fill the following form:');
    expect(formDialog.props('initialName')).toBe('');
    expect(formDialog.props('submitLabel')).toBe('Create');
    expect(formDialog.props('isLoading')).toBe(false);
  });

  it('updates modelValue when WeekFormDialog emits update:modelValue', async () => {
    const wrapper = mount(WeekCreateDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: true,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);
    await formDialog.vm.$emit('update:modelValue', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('calls addWeek and emits close on submit', async () => {
    const wrapper = mount(WeekCreateDialog, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: true,
      },
    });

    const weekStore = useWeekStore();
    const formDialog = wrapper.findComponent(WeekFormDialog);

    await formDialog.vm.$emit('submit', 'New Week');
    await flushPromises();

    expect(weekStore.addWeek).toHaveBeenCalledWith('New Week');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    // One from onCreate, maybe one from somewhere else?
    // Actually, onCreate sets isOpen.value = false which emits update:modelValue
    expect(wrapper.emitted('update:modelValue')!.some((e) => e[0] === false)).toBe(true);
  });

  it('passes isLoading state to WeekFormDialog', async () => {
    let resolveAddWeek: (value: void | PromiseLike<void>) => void;
    const addWeekPromise = new Promise<void>((resolve) => {
      resolveAddWeek = resolve;
    });

    const wrapper = mount(WeekCreateDialog, {
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
        modelValue: true,
      },
    });

    const weekStore = useWeekStore();
    weekStore.addWeek = vi.fn().mockReturnValue(addWeekPromise);

    const formDialog = wrapper.findComponent(WeekFormDialog);

    // Trigger submit
    formDialog.vm.$emit('submit', 'New Week');

    // Wait for the next tick to allow useAsyncCall's isLoading to update
    await wrapper.vm.$nextTick();
    expect(formDialog.props('isLoading')).toBe(true);

    // Resolve the promise
    resolveAddWeek!();
    await flushPromises();

    expect(formDialog.props('isLoading')).toBe(false);
  });
});
