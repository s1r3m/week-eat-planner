import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h, Suspense } from 'vue';
import WeeksPage from '../WeeksPage.vue';
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
            PageTitle: {
              template: '<div><slot name="controls" /><slot /></div>',
            },
            WeeksGrid: true,
            WeekCreateDialog: true,
            WeekEditDialog: true,
            WeekDeleteDialog: true,
            Button: {
              template: '<button @click="$emit(\'click\')"><slot /></button>',
            },
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

  it('opens create dialog when "Add a new week" button is clicked', async () => {
    const wrapper = await mountWithSuspense();
    const createDialog = wrapper.findComponent(WeekCreateDialog);
    expect(createDialog.props('modelValue')).toBe(false);

    const addButton = wrapper.find('button');
    await addButton.trigger('click');

    expect(createDialog.props('modelValue')).toBe(true);
  });

  it('renders empty grid when no weeks are returned', async () => {
    mockApiClient.onGet('/weeks').reply(200, []);
    const wrapper = await mountWithSuspense();

    const weeksGrid = wrapper.findComponent(WeeksGrid);
    expect(weeksGrid.props('weeks')).toEqual([]);
  });
});
