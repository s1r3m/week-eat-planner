import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppAddCard from '../AppAddCard.vue';

describe('AppAddCard', () => {
  it('renders the + icon', () => {
    const wrapper = mount(AppAddCard);
    expect(wrapper.text()).toContain('+');
  });

  it('emits create event when clicked', async () => {
    const wrapper = mount(AppAddCard);
    await wrapper.find('span').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('create');
    expect(wrapper.emitted('create')).toHaveLength(1);
  });
});
