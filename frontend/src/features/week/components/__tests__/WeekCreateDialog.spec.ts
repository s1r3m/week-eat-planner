import { ref } from 'vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekCreateDialog from '../WeekCreateDialog.vue';
import WeekFormDialog from '../WeekFormDialog.vue';
import { useMutation } from '@pinia/colada';

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/weeks', () => ({
  addWeekMutation: vi.fn(),
}));

describe('WeekCreateDialog', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
  });

  it('renders WeekFormDialog with correct props', () => {
    const wrapper = mount(WeekCreateDialog, {
      global: {
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
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: true,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);

    await formDialog.vm.$emit('submit', 'New Week');

    expect(mockMutate).toHaveBeenCalledWith({ name: 'New Week' });
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.some((e) => e[0] === false)).toBe(true);
  });

  it('passes isLoading state to WeekFormDialog', async () => {
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isLoading: ref(true),
    });

    const wrapper = mount(WeekCreateDialog, {
      global: {
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: true,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);
    expect(formDialog.props('isLoading')).toBe(true);
  });
});
