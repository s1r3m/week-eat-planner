import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekFormDialog from '../WeekFormDialog.vue';

describe('WeekFormDialog', () => {
  const defaultProps = {
    title: 'Form Title',
    description: 'Form Description',
    submitLabel: 'Save',
    isLoading: false,
    initialName: '',
  };

  const dialogStubs = {
    Dialog: { template: '<div><slot /></div>', props: ['open'], emits: ['update:open'] },
    DialogContent: { template: '<div><slot /></div>' },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
    DialogDescription: { template: '<div><slot /></div>' },
    DialogFooter: { template: '<div><slot /></div>' },
    DialogClose: { template: '<div><slot /></div>' },
  };

  const mountComponent = (props = {}) =>
    mount(WeekFormDialog, { props: { ...defaultProps, ...props }, global: { stubs: dialogStubs } });

  it('renders title, description, and submit button label', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain(defaultProps.title);
    expect(wrapper.text()).toContain(defaultProps.description);
    expect(wrapper.find('[data-slot="button"][type="submit"]').text()).toBe(
      defaultProps.submitLabel,
    );
  });

  it('enables the submit button when a non-empty, changed name is entered', async () => {
    const wrapper = mountComponent();
    await wrapper.find('[data-slot="input"]').setValue('New Week');
    expect(
      wrapper.find('[data-slot="button"][type="submit"]').attributes('disabled'),
    ).toBeUndefined();
  });

  it('disables the submit button when name is empty or equal to the initial name', async () => {
    const wrapper = mountComponent({ initialName: 'Original' });
    const submitBtn = wrapper.find('[data-slot="button"][type="submit"]');

    expect(submitBtn.attributes('disabled')).toBeDefined();

    await wrapper.find('[data-slot="input"]').setValue('Changed');
    expect(submitBtn.attributes('disabled')).toBeUndefined();

    await wrapper.find('[data-slot="input"]').setValue('Original');
    expect(submitBtn.attributes('disabled')).toBeDefined();

    await wrapper.find('[data-slot="input"]').setValue('   ');
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('emits submit with the entered name when the form is submitted', async () => {
    const wrapper = mountComponent();
    await wrapper.find('[data-slot="input"]').setValue('My New Week');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')![0]).toEqual(['My New Week']);
  });

  it('shows loading spinner and disables submit while isLoading is true', () => {
    const wrapper = mountComponent({ isLoading: true });
    const submitBtn = wrapper.find('[data-slot="button"][type="submit"]');
    expect(submitBtn.text()).toContain('Saving...');
    expect(submitBtn.attributes('disabled')).toBeDefined();
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
  });

  it('syncs the input value when initialName prop changes', async () => {
    const wrapper = mountComponent();
    await wrapper.setProps({ initialName: 'New Initial' });
    expect((wrapper.find('[data-slot="input"]').element as HTMLInputElement).value).toBe(
      'New Initial',
    );
  });

  it('resets the input to empty when initialName prop changes to falsy', async () => {
    const wrapper = mountComponent({ initialName: 'Some Name' });
    await wrapper.setProps({ initialName: undefined });
    expect((wrapper.find('[data-slot="input"]').element as HTMLInputElement).value).toBe('');
  });

  it('emits update:modelValue when the Dialog emits update:open', async () => {
    const wrapper = mountComponent({ modelValue: true });
    await wrapper.findComponent(dialogStubs.Dialog).vm.$emit('update:open', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('initializes with empty input when initialName is undefined', () => {
    const { initialName, ...propsWithoutInitial } = defaultProps;
    const wrapper = mountComponent(propsWithoutInitial);
    expect((wrapper.find('[data-slot="input"]').element as HTMLInputElement).value).toBe('');
  });
});
