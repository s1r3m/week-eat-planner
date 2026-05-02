import { ref } from 'vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekDeleteDialog from '../WeekDeleteDialog.vue';
import { useMutation } from '@pinia/colada';

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/weeks', () => ({
  deleteWeekMutation: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('WeekDeleteDialog', () => {
  const mockWeek = { id: 'week_id', name: 'Week 1', user_id: 'user_id', week_days: [] };
  const mockMutate = vi.fn();
  const mockIsLoading = ref(false);

  const dialogStubs = {
    Dialog: {
      name: 'Dialog',
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.value = false;
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate, isLoading: mockIsLoading } as any);
  });

  const mountComponent = (modelValue = mockWeek) =>
    mount(WeekDeleteDialog, {
      props: { modelValue },
      global: { stubs: dialogStubs },
    });

  it('renders week name and confirmation message', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Delete Week 1?');
    expect(wrapper.text()).toContain('Are you sure you want to delete Week 1?');
  });

  it('calls remove mutation and closes dialog when Yes is clicked', async () => {
    const wrapper = mountComponent();
    const yesButton = wrapper.findAll('[data-slot="button"]').find((b) => b.text().includes('Yes'));
    expect(yesButton).toBeDefined();
    await yesButton!.trigger('click');

    expect(mockMutate).toHaveBeenCalledWith(mockWeek.id);
    expect(wrapper.emitted('update:modelValue')?.some((e) => e[0] === null)).toBe(true);
  });

  it('does not call mutation when Yes is clicked and week is null', async () => {
    const wrapper = mount(WeekDeleteDialog, {
      props: { modelValue: mockWeek },
      global: { stubs: dialogStubs },
    });
    const yesButton = wrapper.findAll('[data-slot="button"]').find((b) => b.text().includes('Yes'));
    await wrapper.setProps({ modelValue: null });
    await yesButton?.trigger('click');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows loading spinner and disables the Yes button while deleting', () => {
    mockIsLoading.value = true;
    const wrapper = mountComponent();

    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Deleting...');
    const deletingBtn = wrapper
      .findAll('[data-slot="button"]')
      .find((b) => b.text().includes('Deleting...'));
    expect(deletingBtn?.attributes('disabled')).toBeDefined();
  });

  describe('dialog open/close', () => {
    it('emits update:modelValue with null when dialog closes', async () => {
      const wrapper = mountComponent();
      await wrapper.findComponent({ name: 'Dialog' }).vm.$emit('update:open', false);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
    });

    it('does not emit when dialog open event fires with true', async () => {
      const wrapper = mountComponent();
      await wrapper.findComponent({ name: 'Dialog' }).vm.$emit('update:open', true);
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });
});
