import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EditDeleteActions from './EditDeleteActions.vue';
import { Button } from '@/components/ui/button';

describe('EditDeleteActions', () => {
  it('renders both buttons', () => {
    const wrapper = mount(EditDeleteActions);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons).toHaveLength(2);
  });

  it('emits "edit" when the first button is clicked', async () => {
    const wrapper = mount(EditDeleteActions);
    const editButton = wrapper.findAllComponents(Button)[0];

    await editButton.trigger('click');

    expect(wrapper.emitted()).toHaveProperty('edit');
    expect(wrapper.emitted('edit')).toHaveLength(1);
  });

  it('emits "delete" when the second button is clicked', async () => {
    const wrapper = mount(EditDeleteActions);
    const deleteButton = wrapper.findAllComponents(Button)[1];

    await deleteButton.trigger('click');

    expect(wrapper.emitted()).toHaveProperty('delete');
    expect(wrapper.emitted('delete')).toHaveLength(1);
  });
});
