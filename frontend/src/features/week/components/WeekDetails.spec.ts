import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekDetails from './WeekDetails.vue';

describe('WeekDetails', () => {
  const mockWeek = { id: 'week_123', name: 'Delicious Week', user_id: 'user_1' };

  const stubs = {
    'router-link': {
      template: '<a :href="to.name + \'/\' + to.params.id"><slot /></a>',
      props: ['to'],
    },
    EditDeleteActions: {
      template:
        '<div class="actions"><button @click="$emit(\'edit\')">Edit</button><button @click="$emit(\'delete\')">Delete</button></div>',
      emits: ['edit', 'delete'],
    },
  };

  it('renders week name correctly', () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: { week: mockWeek },
    });

    expect(wrapper.text()).toContain(mockWeek.name);
  });

  it('renders image with correct attributes', () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: { week: mockWeek },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Week Image');
    expect(img.attributes('loading')).toBe('lazy');
    // We can't easily test the absolute path of default_img because of URL import,
    // but we can check if it has a src.
    expect(img.attributes('src')).toBeDefined();
  });

  it('renders router-link with correct destination', () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: { week: mockWeek },
    });

    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    // Based on our stub:
    expect(link.attributes('href')).toBe('week/week_123');
  });

  it('emits edit event when EditDeleteActions emits edit', async () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: { week: mockWeek },
    });

    const editButton = wrapper.findAll('button').find((b) => b.text() === 'Edit');
    await editButton?.trigger('click');

    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')![0]).toEqual([mockWeek]);
  });

  it('emits delete event when EditDeleteActions emits delete', async () => {
    const wrapper = mount(WeekDetails, {
      global: { stubs },
      props: { week: mockWeek },
    });

    const deleteButton = wrapper.findAll('button').find((b) => b.text() === 'Delete');
    await deleteButton?.trigger('click');

    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')![0]).toEqual([mockWeek]);
  });
});
