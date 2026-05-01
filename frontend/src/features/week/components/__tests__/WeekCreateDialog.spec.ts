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
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate, isLoading: ref(false) } as any);
  });

  const mountComponent = (modelValue = true) =>
    mount(WeekCreateDialog, {
      props: { modelValue },
      global: { stubs: { WeekFormDialog: true } },
    });

  it('passes correct props to WeekFormDialog', () => {
    const formDialog = mountComponent().findComponent(WeekFormDialog);
    expect(formDialog.exists()).toBe(true);
    expect(formDialog.props('title')).toBe('Add new Week');
    expect(formDialog.props('description')).toBe('Fill the following form:');
    expect(formDialog.props('initialName')).toBe('');
    expect(formDialog.props('submitLabel')).toBe('Create');
    expect(formDialog.props('isLoading')).toBe(false);
  });

  it('propagates isLoading to WeekFormDialog', () => {
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate, isLoading: ref(true) } as any);
    expect(mountComponent().findComponent(WeekFormDialog).props('isLoading')).toBe(true);
  });

  it('calls createWeek and closes dialog on submit', async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent(WeekFormDialog).vm.$emit('submit', 'New Week');

    expect(mockMutate).toHaveBeenCalledWith({ name: 'New Week' });
    expect(wrapper.emitted('update:modelValue')?.some((e) => e[0] === false)).toBe(true);
  });

  it('emits update:modelValue when WeekFormDialog emits it', async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent(WeekFormDialog).vm.$emit('update:modelValue', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });
});
