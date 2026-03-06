import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h, Suspense } from 'vue';
import WeeksPage from './WeeksPage.vue';
import { weekService } from '@/features/week/api/week.service';
import { WeeksGrid, WeekCreateDialog, WeekEditDialog, WeekDeleteDialog } from '@/features/week';
import type { UserWeekMinimal } from '@/domain/week/models';

vi.mock('@/features/week/api/week.service', () => ({
  weekService: {
    fetchWeeks: vi.fn(),
  },
}));

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

describe('WeeksPage', () => {
  const mockWeeks: UserWeekMinimal[] = [
    { id: '1', name: 'Week 1', user_id: 'user_id' },
    { id: '2', name: 'Week 2', user_id: 'user_id' },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(weekService.fetchWeeks).mockResolvedValue(mockWeeks);
  });

  it('renders correctly after fetching weeks', async () => {
    const wrapper = await mountWithSuspense();

    expect(weekService.fetchWeeks).toHaveBeenCalled();
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

  it('renders empty grid when no weeks are returned', async () => {
    vi.mocked(weekService.fetchWeeks).mockResolvedValue([]);
    const wrapper = await mountWithSuspense();

    const weeksGrid = wrapper.findComponent(WeeksGrid);
    expect(weeksGrid.props('weeks')).toEqual([]);
  });
});
