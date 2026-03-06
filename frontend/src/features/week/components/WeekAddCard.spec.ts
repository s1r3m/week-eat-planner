import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekAddCard from './WeekAddCard.vue';

describe('WeekAddCard', () => {
  it('renders the + icon', () => {
    const wrapper = mount(WeekAddCard);
    expect(wrapper.text()).toContain('+');
  });

  it('emits create event when clicked', async () => {
    const wrapper = mount(WeekAddCard);
    await wrapper.find('div').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('create');
    expect(wrapper.emitted('create')).toHaveLength(1);
  });
});
