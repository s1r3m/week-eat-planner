import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import WeeksPage from '../WeeksPage.vue';
import { WeeksGrid, WeekCreateDialog } from '@/features/week';
import { useQuery } from '@pinia/colada';

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/api/weeks', () => ({
  getWeeksQuery: vi.fn(() => ({ key: ['weeks', 'list'], query: vi.fn() })),
}));

describe('WeeksPage', () => {
  const mockWeeks = [
    { id: '1', name: 'Week 1', user_id: 'user_id' },
    { id: '2', name: 'Week 2', user_id: 'user_id' },
  ];

  const stubs = {
    PageTitle: {
      template: '<div><h1>{{ header }}</h1><slot name="controls" /></div>',
      props: ['header'],
    },
    WeeksGrid: {
      template: '<div class="weeks-grid" />',
      props: ['weeks'],
    },
    WeekCreateDialog: {
      template: '<div class="create-dialog" v-if="modelValue" />',
      props: ['modelValue'],
    },
    Button: {
      template: '<button @click="$emit(\'click\')"><slot /></button>',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(true),
      error: ref(null),
    });

    const wrapper = mount(WeeksPage, {
      global: { stubs },
    });

    expect(wrapper.find('svg.lucide-loader-circle').exists()).toBe(true);
  });

  it('renders error state', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref({ message: 'Failed to fetch' }),
      refetch: vi.fn(),
    });

    const wrapper = mount(WeeksPage, {
      global: { stubs },
    });

    expect(wrapper.text()).toContain('An error has occurred');
    expect(wrapper.text()).toContain('Failed to fetch');
    expect(wrapper.find('svg.lucide-message-circle-x').exists()).toBe(true);
  });

  it('renders weeks grid when data is loaded', () => {
    (useQuery as any).mockReturnValue({
      data: ref(mockWeeks),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(WeeksPage, {
      global: { stubs },
    });

    expect(wrapper.find('h1').text()).toBe('My Weeks');
    const weeksGrid = wrapper.findComponent(stubs.WeeksGrid);
    expect(weeksGrid.exists()).toBe(true);
    expect(weeksGrid.props('weeks')).toEqual(mockWeeks);
  });

  it('opens create dialog when button is clicked', async () => {
    (useQuery as any).mockReturnValue({
      data: ref(mockWeeks),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(WeeksPage, {
      global: { stubs },
    });

    const addButton = wrapper.findAll('button').find((b) => b.text().includes('Add a new week'));
    await addButton?.trigger('click');

    const createDialog = wrapper.findComponent(stubs.WeekCreateDialog);
    expect(createDialog.exists()).toBe(true);
  });

  it('closes create dialog when it emits update:modelValue with false', async () => {
    (useQuery as any).mockReturnValue({
      data: ref(mockWeeks),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mount(WeeksPage, {
      global: { stubs },
    });

    const addButton = wrapper.findAll('button').find((b) => b.text().includes('Add a new week'));
    await addButton?.trigger('click');

    const createDialog = wrapper.findComponent(stubs.WeekCreateDialog);
    await createDialog.vm.$emit('update:modelValue', false);

    expect(wrapper.find('.create-dialog').exists()).toBe(false);
  });

  it('calls refetch when Try Again is clicked', async () => {
    const mockRefetch = vi.fn();
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref({ message: 'Error' }),
      refetch: mockRefetch,
    });

    const wrapper = mount(WeeksPage, {
      global: { stubs },
    });

    const tryAgainButton = wrapper.findAll('button').find((b) => b.text().includes('Try again'));
    await tryAgainButton?.trigger('click');
    expect(mockRefetch).toHaveBeenCalled();
  });
});
