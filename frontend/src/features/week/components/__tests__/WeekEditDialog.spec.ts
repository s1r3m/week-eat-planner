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
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate, isLoading: false } as any);
  });

  const mountComponent = (modelValue = mockWeek) =>
    mount(WeekEditDialog, {
      props: { modelValue },
      global: { stubs: { WeekFormDialog: true } },
    });

  it('passes correct props to WeekFormDialog', () => {
    const formDialog = mountComponent().findComponent(WeekFormDialog);
    expect(formDialog.exists()).toBe(true);
    expect(formDialog.props('title')).toBe(`Edit ${mockWeek.name}`);
    expect(formDialog.props('initialName')).toBe(mockWeek.name);
    expect(formDialog.props('submitLabel')).toBe('Save');
    expect(formDialog.props('isLoading')).toBe(false);
  });

  it('propagates isLoading to WeekFormDialog', () => {
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate, isLoading: true } as any);
    expect(mountComponent().findComponent(WeekFormDialog).props('isLoading')).toBe(true);
  });

  it('calls updateWeek and closes dialog on submit', async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent(WeekFormDialog).vm.$emit('submit', 'Updated Week Name');

    expect(mockMutate).toHaveBeenCalledWith({
      id: mockWeek.id,
      payload: { name: 'Updated Week Name' },
    });
    expect(wrapper.emitted('update:modelValue')?.some((e) => e[0] === null)).toBe(true);
  });

  it('emits update:modelValue with null when WeekFormDialog emits false', async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent(WeekFormDialog).vm.$emit('update:modelValue', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
  });

  it('does not emit when WeekFormDialog emits update:modelValue with true', async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent(WeekFormDialog).vm.$emit('update:modelValue', true);
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('does not call mutation twice when submit fires consecutively', async () => {
    const wrapper = mountComponent();
    const formDialog = wrapper.findComponent(WeekFormDialog);
    formDialog.vm.$emit('submit', 'New Name');
    formDialog.vm.$emit('submit', 'Another Name');

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
