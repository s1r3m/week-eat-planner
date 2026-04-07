import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import WeekSinglePage from '../WeekSinglePage.vue';
import { useQuery } from '@pinia/colada';
import { useRoute } from 'vue-router';

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

vi.mock('@/api/weeks', () => ({
  getWeekQuery: vi.fn((id) => ({ key: ['weeks', 'detail', id], query: vi.fn() })),
}));

describe('WeekSinglePage', () => {
  const mockWeek = {
    id: 'week_123',
    name: 'My Week',
    user_id: 'user_1',
    week_days: [],
  };

  const stubs = {
    PageTitle: {
      template: '<div><h1>{{ header }}</h1><slot name="controls" /></div>',
      props: ['header'],
    },
    MealSlotGrid: {
      template: '<div class="meal-slot-grid" />',
      props: ['weekDays'],
    },
    WeekEditDialog: {
      template: '<div class="edit-dialog" v-if="modelValue" />',
      props: ['modelValue'],
    },
    WeekDeleteDialog: {
      template: '<div class="delete-dialog" v-if="modelValue" />',
      props: ['modelValue'],
    },
    Button: {
      template: '<button @click="$emit(\'click\')"><slot /></button>',
      props: ['variant', 'size'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoute as any).mockReturnValue({
      params: { id: 'week_123' },
    });
  });

  it('renders error state', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref({ message: 'Failed to load' }),
      refetch: vi.fn(),
    });

    const wrapper = mount(WeekSinglePage, {
      global: { stubs },
    });

    expect(wrapper.text()).toContain('An error has occurred');
    expect(wrapper.text()).toContain('Failed to load');
    expect(wrapper.find('svg.lucide-message-circle-x').exists()).toBe(true);
  });

  it('renders week details when loaded', () => {
    (useQuery as any).mockReturnValue({
      data: ref(mockWeek),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(WeekSinglePage, {
      global: { stubs },
    });

    expect(wrapper.find('h1').text()).toBe(mockWeek.name);
    expect(wrapper.findComponent(stubs.MealSlotGrid).exists()).toBe(true);
  });

  it('opens edit dialog when edit button is clicked', async () => {
    (useQuery as any).mockReturnValue({
      data: ref(mockWeek),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(WeekSinglePage, {
      global: { stubs },
    });

    const editButton = wrapper.findAll('button').find((b) => b.text().includes('Edit'));
    await editButton?.trigger('click');

    const editDialog = wrapper.findComponent(stubs.WeekEditDialog);
    expect(editDialog.props('modelValue')).toEqual(mockWeek);
  });

  it('opens delete dialog when delete button is clicked', async () => {
    (useQuery as any).mockReturnValue({
      data: ref(mockWeek),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(WeekSinglePage, {
      global: { stubs },
    });

    const deleteButton = wrapper.findAll('button').find((b) => b.text().includes('Delete'));
    await deleteButton?.trigger('click');

    const deleteDialog = wrapper.findComponent(stubs.WeekDeleteDialog);
    expect(deleteDialog.props('modelValue')).toEqual(mockWeek);
  });

  it('closes edit dialog when it emits update:modelValue with null', async () => {
    (useQuery as any).mockReturnValue({
      data: ref(mockWeek),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(WeekSinglePage, {
      global: { stubs },
    });

    const editButton = wrapper.findAll('button').find((b) => b.text().includes('Edit'));
    await editButton?.trigger('click');

    const editDialog = wrapper.findComponent(stubs.WeekEditDialog);
    await editDialog.vm.$emit('update:modelValue', null);

    expect(wrapper.find('.edit-dialog').exists()).toBe(false);
  });

  it('closes delete dialog when it emits update:modelValue with null', async () => {
    (useQuery as any).mockReturnValue({
      data: ref(mockWeek),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(WeekSinglePage, {
      global: { stubs },
    });

    const deleteButton = wrapper.findAll('button').find((b) => b.text().includes('Delete'));
    await deleteButton?.trigger('click');

    const deleteDialog = wrapper.findComponent(stubs.WeekDeleteDialog);
    await deleteDialog.vm.$emit('update:modelValue', null);

    expect(wrapper.find('.delete-dialog').exists()).toBe(false);
  });
});
