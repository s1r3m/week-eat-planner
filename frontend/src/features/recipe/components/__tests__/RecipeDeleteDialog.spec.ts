import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import RecipeDeleteDialog from '../RecipeDeleteDialog.vue';
import { useMutation } from '@pinia/colada';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

vi.mock('@pinia/colada', () => ({
  defineQueryOptions: (fn: any) => fn,
  defineMutation: (fn: any) => fn,
  useMutation: vi.fn(),
  useQueryCache: vi.fn(() => ({
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('@/api/recipes', () => ({
  deleteRecipeMutation: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('RecipeDeleteDialog', () => {
  const mockMutate = vi.fn();
  const mockIsLoading = ref(false);
  const recipe = { id: '1', name: 'Test Recipe', author: 'Author' };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockIsLoading.value = false;
    vi.mocked(useMutation).mockReturnValue({ mutate: mockMutate, isLoading: mockIsLoading } as any);
  });

  const globalMountOptions = {
    stubs: {
      Dialog: { name: 'Dialog', template: '<div><slot /></div>', props: ['open'] },
      DialogContent: { template: '<div><slot /></div>' },
      DialogHeader: { template: '<div><slot /></div>' },
      DialogTitle: { template: '<div><slot /></div>' },
      DialogDescription: { template: '<div><slot /></div>' },
      DialogFooter: { template: '<div><slot /></div>' },
      DialogClose: { template: '<div><slot /></div>' },
    },
  };

  const mountComponent = (props = {}) =>
    mount(RecipeDeleteDialog, {
      props: { modelValue: recipe, ...props },
      global: globalMountOptions,
    });

  it('renders nothing when recipe is null', () => {
    const wrapper = mountComponent({ modelValue: null });
    expect(wrapper.find('p').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Are you sure you want to delete');
  });

  it('renders the recipe name and confirmation message', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Delete Test Recipe?');
    expect(wrapper.text()).toContain('Are you sure you want to delete Test Recipe?');
  });

  it('calls delete mutation and redirects to My Recipes when Yes is clicked', async () => {
    const wrapper = mountComponent();
    const deleteButton = wrapper
      .findAll('[data-slot="button"]')
      .find((btn) => btn.text().includes('Yes'));
    if (!deleteButton) throw new Error('Yes button not found');
    await deleteButton.trigger('click');

    expect(mockMutate).toHaveBeenCalledWith('1');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
    expect(mockPush).toHaveBeenCalledWith({ name: ROUTE_NAMES.RECIPES_MY });
  });

  it('shows loading spinner and disables the button while deleting', () => {
    mockIsLoading.value = true;
    const wrapper = mountComponent();

    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Deleting...');
    const deleteButton = wrapper
      .findAll('[data-slot="button"]')
      .find((btn) => btn.text().includes('Deleting...'));
    expect(deleteButton?.attributes('disabled')).toBeDefined();
  });

  describe('dialog open/close', () => {
    it('emits update:modelValue with null when dialog closes', async () => {
      const wrapper = mountComponent();
      await wrapper.findComponent({ name: 'Dialog' }).vm.$emit('update:open', false);
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
    });

    it('does not emit when dialog open event fires with true', async () => {
      const wrapper = mountComponent();
      await wrapper.findComponent({ name: 'Dialog' }).vm.$emit('update:open', true);
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
  });

  it('does not call mutation when recipe is null during delete', async () => {
    const wrapper = mountComponent({ modelValue: null });
    (wrapper.vm as any).onDelete?.();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
