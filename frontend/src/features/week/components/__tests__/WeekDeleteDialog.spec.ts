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

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('WeekDeleteDialog', () => {
  const mockWeek = { id: 'week_id', name: 'Week 1', user_id: 'user_id', week_days: [] };
  const mockMutate = vi.fn();

  const stubs = {
    Dialog: {
      template: '<div><slot /></div>',
      props: ['modelValue', 'open'], // WeekDeleteDialog uses v-model:open="isOpen"
      emits: ['update:modelValue', 'update:open'],
    },
    DialogContent: { template: '<div><slot /></div>' },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
    DialogDescription: { template: '<div><slot /></div>' },
    DialogFooter: { template: '<div><slot /></div>' },
    DialogClose: { template: '<div><slot /></div>' },
    Spinner: true,
    Button: {
      template: '<button :disabled="disabled"><slot /></button>',
      props: ['disabled'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isLoading: ref(false),
    });
  });

  it('renders correctly with week name', () => {
    const wrapper = mount(WeekDeleteDialog, {
      global: {
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
        stubs,
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const dialog = wrapper.findComponent(stubs.Dialog);
    await dialog.vm.$emit('update:open', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
  });

  it('does nothing when Dialog emits update:open with true', async () => {
    const wrapper = mount(WeekDeleteDialog, {
      global: {
        stubs,
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const dialog = wrapper.findComponent(stubs.Dialog);
    await dialog.vm.$emit('update:open', true);

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('calls removeWeek and closes dialog when Yes button is clicked', async () => {
    const wrapper = mount(WeekDeleteDialog, {
      global: {
        stubs,
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const yesButton = wrapper.findAll('button').find((b) => b.text().includes('Yes'));
    await yesButton?.trigger('click');

    expect(mockMutate).toHaveBeenCalledWith(mockWeek.id);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')!.some((e) => e[0] === null)).toBe(true);
  });

  it('does nothing when Yes button is clicked and week is null', async () => {
    const wrapper = mount(WeekDeleteDialog, {
      global: {
        stubs,
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const yesButton = wrapper.findAll('button').find((b) => b.text().includes('Yes'));
    await wrapper.setProps({ modelValue: null });
    await yesButton?.trigger('click');

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state and disables button during deletion', async () => {
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isLoading: true,
    });

    const wrapper = mount(WeekDeleteDialog, {
      global: {
        stubs: {
          ...stubs,
          Spinner: { template: '<div class="spinner"></div>' },
        },
      },
      props: {
        modelValue: mockWeek,
      },
    });

    const yesButton = wrapper.findAll('button').find((b) => b.text().includes('Deleting...'));
    expect(yesButton?.exists()).toBe(true);
    expect((yesButton?.element as HTMLButtonElement).disabled).toBe(true);
  });
});
