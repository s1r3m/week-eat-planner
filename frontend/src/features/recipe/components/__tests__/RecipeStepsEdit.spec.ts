import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RecipeStepsEdit from '../RecipeStepsEdit.vue';
import { useForm } from 'vee-validate';
import { defineComponent } from 'vue';

const TestWrapper = defineComponent({
  components: { RecipeStepsEdit },
  props: { initialValues: { type: Object, required: true } },
  setup(props) {
    useForm({ initialValues: props.initialValues });
    return {};
  },
  template: '<RecipeStepsEdit />',
});

describe('RecipeStepsEdit', () => {
  const initialValues = {
    steps: [{ order: 1, step: '' }],
  };

  it('renders the initial step', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(1);
  });

  it('adds a step automatically when the last one is filled', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(1);
    const input = wrapper.find('input');
    await input.setValue('Wash vegetables');
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('removes a step when the remove button is clicked', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();

    // Add steps by filling them
    await wrapper.findAll('input')[0].setValue('Step 1');
    await flushPromises();
    await wrapper.findAll('input')[1].setValue('Step 2');
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(3);

    const removeButtons = wrapper.findAll('button.text-destructive');
    await removeButtons[0].trigger('click');
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('updates step text on input', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();
    const input = wrapper.find('input');
    await input.setValue('Wash vegetables');
    expect((input.element as HTMLInputElement).value).toBe('Wash vegetables');
  });
});
