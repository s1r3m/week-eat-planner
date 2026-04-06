import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekEditDialog from '../WeekEditDialog.vue';
import WeekFormDialog from '../WeekFormDialog.vue';
import { useMutation } from '@pinia/colada';

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/weeks', () => ({
  editWeekMutation: vi.fn(),
}));

describe('WeekEditDialog', () => {
  const mockWeek = { id: 'week_1', name: 'Week 1', user_id: 'user_1' };
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
  });

  it('renders WeekFormDialog with correct props', () => {
    const wrapper = mount(WeekEditDialog, {
      global: {
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: mockWeek,
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
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);

    await formDialog.vm.$emit('submit', 'Updated Week Name');

    expect(mockMutate).toHaveBeenCalledWith({
      id: mockWeek.id,
      payload: { name: 'Updated Week Name' },
    });
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.some((e) => e[0] === null)).toBe(true);
  });

  it('does nothing when WeekFormDialog emits update:modelValue with true', async () => {
    const wrapper = mount(WeekEditDialog, {
      global: {
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);
    await formDialog.vm.$emit('update:modelValue', true);

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('passes isLoading state to WeekFormDialog', async () => {
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isLoading: true,
    });

    const wrapper = mount(WeekEditDialog, {
      global: {
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);
    expect(formDialog.props('isLoading')).toBe(true);
  });

  it('updates modelValue when WeekFormDialog emits update:modelValue', async () => {
    const wrapper = mount(WeekEditDialog, {
      global: {
        stubs: {
          WeekFormDialog: true,
        },
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const formDialog = wrapper.findComponent(WeekFormDialog);
    await formDialog.vm.$emit('update:modelValue', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
  });
});
