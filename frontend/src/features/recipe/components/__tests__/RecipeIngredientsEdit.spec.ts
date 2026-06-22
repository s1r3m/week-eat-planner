import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RecipeIngredientsEdit from '../RecipeIngredientsEdit.vue';
import { useForm } from 'vee-validate';
import { defineComponent } from 'vue';

vi.mock('@/components/ui/select', () => ({
  Select: {
    name: 'Select',
    template: '<div><slot /></div>',
    props: ['modelValue', 'defaultValue'],
    emits: ['update:modelValue'],
  },
  SelectContent: { template: '<div><slot /></div>' },
  SelectGroup: { template: '<div><slot /></div>' },
  SelectItem: { template: '<div><slot /></div>' },
  SelectTrigger: { template: '<div><slot /></div>' },
  SelectValue: { template: '<div><slot /></div>' },
}));

const TestWrapper = defineComponent({
  components: { RecipeIngredientsEdit },
  props: ['initialValues'],
  setup(props) {
    const form = useForm({ initialValues: props.initialValues });
    return { form };
  },
  template: '<RecipeIngredientsEdit />',
});

describe('RecipeIngredientsEdit', () => {
  const initialValues = {
    ingredients: [{ name: '', amount: 0, unit: 'g' }],
  };

  it('renders the initial ingredient', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(1);
  });

  it('adds an ingredient automatically when the last one is filled', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(1);
    const nameInput = wrapper.find('input[type="text"]');
    await nameInput.setValue('Flour');
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('removes an ingredient when the remove button is clicked', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();

    // Add an ingredient by filling the first one
    await wrapper.find('input[type="text"]').setValue('Flour');
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(2);

    // The first one should have a delete button now because it's not the last one
    await wrapper.find('button.text-destructive').trigger('click');
    await flushPromises();
    expect(wrapper.findAll('li')).toHaveLength(1);
  });

  it('updates ingredient name and amount on input', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();

    const nameInput = wrapper.find('input[type="text"]');
    const amountInput = wrapper.find('input[type="number"]');

    await nameInput.setValue('Flour');
    await amountInput.setValue(500);
    await flushPromises();

    expect((nameInput.element as HTMLInputElement).value).toBe('Flour');
    expect((amountInput.element as HTMLInputElement).value).toBe('500');
  });

  it('updates ingredient unit when the select emits a new value', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();

    await wrapper.findComponent({ name: 'Select' }).vm.$emit('update:modelValue', 'ml');
    await flushPromises();

    // Check form state directly since we don't have props anymore
    expect((wrapper.vm as any).form.values.ingredients[0].unit).toBe('ml');
  });

  it('renders all available unit options', async () => {
    const wrapper = mount(TestWrapper, { props: { initialValues } });
    await flushPromises();

    expect(wrapper.text()).toContain('g');
    expect(wrapper.text()).toContain('ml');
    expect(wrapper.text()).toContain('pcs');
    expect(wrapper.text()).toContain('cans');
  });
});
