import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h, Suspense } from 'vue';
import WeeksPage from './WeeksPage.vue';
import { WeeksGrid, WeekCreateDialog, WeekEditDialog, WeekDeleteDialog } from '@/features/week';
import type { UserWeekMinimal } from '@/domain/week/models';
import { apiClient } from '@/api/client';
import MockAdapter from 'axios-mock-adapter';

describe('WeeksPage', () => {
  let mockApiClient: MockAdapter;

  const mockWeeks: UserWeekMinimal[] = [
    { id: '1', name: 'Week 1', user_id: 'user_id' },
    { id: '2', name: 'Week 2', user_id: 'user_id' },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiClient = new MockAdapter(apiClient);
    vi.clearAllMocks();
    mockApiClient.onGet('/weeks').reply(200, mockWeeks);
  });

  afterEach(() => {
    mockApiClient.restore();
  });

  const mountWithSuspense = async (options = {}) => {
    const wrapper = mount(
      defineComponent({
        render() {
          return h(Suspense, null, {
            default: h(WeeksPage),
            fallback: h('div', 'Loading...'),
          });
        },
      }),
      {
        global: {
          plugins: [createPinia()],
          stubs: {
            PageTitle: true,
            WeeksGrid: true,
            WeekCreateDialog: true,
            WeekEditDialog: true,
            WeekDeleteDialog: true,
          },
        },
        ...options,
      },
    );

    await flushPromises();
    return wrapper;
  };

  it('renders correctly after fetching weeks', async () => {
    const wrapper = await mountWithSuspense();

    const weeksGrid = wrapper.findComponent(WeeksGrid);
    expect(weeksGrid.exists()).toBe(true);
    expect(weeksGrid.props('weeks')).toEqual(mockWeeks);
  });

  it('opens create dialog when WeeksGrid emits create', async () => {
    const wrapper = await mountWithSuspense();
    const weeksGrid = wrapper.findComponent(WeeksGrid);

    await weeksGrid.vm.$emit('create');

    const createDialog = wrapper.findComponent(WeekCreateDialog);
    expect(createDialog.props('modelValue')).toBe(true);
  });

  it('opens edit dialog when WeeksGrid emits edit', async () => {
    const wrapper = await mountWithSuspense();
    const weeksGrid = wrapper.findComponent(WeeksGrid);
    const targetWeek = mockWeeks[0];

    await weeksGrid.vm.$emit('edit', targetWeek);

    const editDialog = wrapper.findComponent(WeekEditDialog);
    expect(editDialog.props('modelValue')).toEqual(targetWeek);
  });

  it('opens delete dialog when WeeksGrid emits delete', async () => {
    const wrapper = await mountWithSuspense();
    const weeksGrid = wrapper.findComponent(WeeksGrid);
    const targetWeek = mockWeeks[1];

    await weeksGrid.vm.$emit('delete', targetWeek);

    const deleteDialog = wrapper.findComponent(WeekDeleteDialog);
    expect(deleteDialog.props('modelValue')).toEqual(targetWeek);
  });

  it('closes create dialog when v-model changes', async () => {
    const wrapper = await mountWithSuspense();
    const createDialog = wrapper.findComponent(WeekCreateDialog);

    // Open it first
    const weeksGrid = wrapper.findComponent(WeeksGrid);
    await weeksGrid.vm.$emit('create');
    expect(createDialog.props('modelValue')).toBe(true);

    // Close it via v-model update
    await createDialog.vm.$emit('update:modelValue', false);
    expect(createDialog.props('modelValue')).toBe(false);
  });

  it('resets editingWeek when WeekEditDialog emits update:modelValue null', async () => {
    const wrapper = await mountWithSuspense();
    const weeksGrid = wrapper.findComponent(WeeksGrid);
    const targetWeek = mockWeeks[0];

    await weeksGrid.vm.$emit('edit', targetWeek);
    const editDialog = wrapper.findComponent(WeekEditDialog);
    expect(editDialog.props('modelValue')).toEqual(targetWeek);

    await editDialog.vm.$emit('update:modelValue', null);
    expect(editDialog.props('modelValue')).toBeNull();
  });

  it('resets deletingWeek when WeekDeleteDialog emits update:modelValue null', async () => {
    const wrapper = await mountWithSuspense();
    const weeksGrid = wrapper.findComponent(WeeksGrid);
    const targetWeek = mockWeeks[0];

    await weeksGrid.vm.$emit('delete', targetWeek);
    const deleteDialog = wrapper.findComponent(WeekDeleteDialog);
    expect(deleteDialog.props('modelValue')).toEqual(targetWeek);

    await deleteDialog.vm.$emit('update:modelValue', null);
    expect(deleteDialog.props('modelValue')).toBeNull();
  });

  it('renders empty grid when no weeks are returned', async () => {
    mockApiClient.onGet('/weeks').reply(200, []);
    const wrapper = await mountWithSuspense();

    const weeksGrid = wrapper.findComponent(WeeksGrid);
    expect(weeksGrid.props('weeks')).toEqual([]);
  });
});
