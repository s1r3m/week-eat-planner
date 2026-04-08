import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import RecipeDeleteDialog from '../RecipeDeleteDialog.vue';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const mockMutate = vi.fn();
const mockIsLoading = ref(false);

vi.mock('@pinia/colada', () => ({
  defineQueryOptions: vi.fn((fn) => fn),
  defineMutation: vi.fn((fn) => fn),
  useMutation: vi.fn(() => ({
    mutate: mockMutate,
    isLoading: mockIsLoading,
  })),
  useQueryCache: vi.fn(() => ({
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  })),
}));

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('RecipeDeleteDialog', () => {
  const recipe = { id: '1', name: 'Test Recipe', author: 'Author' };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockIsLoading.value = false;
  });

  const mountComponent = (props = {}) => {
    return mount(RecipeDeleteDialog, {
      props: {
        modelValue: recipe,
        ...props,
      },
      global: {
        stubs: {
          Dialog: {
            name: 'Dialog',
            template: '<div><slot /></div>',
            props: ['open'],
          },
          DialogContent: { template: '<div><slot /></div>' },
          DialogHeader: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
          DialogDescription: { template: '<div><slot /></div>' },
          DialogFooter: { template: '<div><slot /></div>' },
          DialogClose: {
            template: '<div><slot /></div>',
          },
          Spinner: { template: '<div class="spinner"></div>' },
          Button: {
            template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['disabled'],
          },
        },
      },
    });
  };

  it('renders nothing when recipe is null', () => {
    const wrapper = mountComponent({ modelValue: null });
    expect(wrapper.find('p').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Are you sure you want to delete');
  });

  it('renders recipe name and confirmation message', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Delete Test Recipe?');
    expect(wrapper.text()).toContain('Are you sure you want to delete Test Recipe?');
  });

  it('calls delete mutation and redirects when Yes is clicked', async () => {
    const wrapper = mountComponent();
    const deleteButton = wrapper.findAll('button').find((btn) => btn.text().includes('Yes'));

    if (!deleteButton) throw new Error('Yes button not found');
    await deleteButton.trigger('click');

    expect(mockMutate).toHaveBeenCalledWith('1');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
    expect(mockPush).toHaveBeenCalledWith({ name: ROUTE_NAMES.RECIPES_MY });
  });

  it('shows loading state when mutation is in progress', () => {
    mockIsLoading.value = true;
    const wrapper = mountComponent();

    expect(wrapper.find('.spinner').exists()).toBe(true);
    expect(wrapper.text()).toContain('Deleting...');
    const buttons = wrapper.findAll('button');
    const deleteButton = buttons.find((btn) => btn.text().includes('Deleting...'));
    expect(deleteButton?.element.disabled).toBe(true);
  });

  it('updates model to null when dialog is closed', async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent({ name: 'Dialog' }).vm.$emit('update:open', false);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
  });

  it('does not update model when dialog open state is true', async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent({ name: 'Dialog' }).vm.$emit('update:open', true);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('returns early if recipe is null during onDelete', async () => {
    const wrapper = mountComponent({ modelValue: null });
    const buttons = wrapper.findAll('button');
    const deleteButton = buttons.find((btn) => btn.text().includes('Yes'));
    await deleteButton?.trigger('click');
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
