import { describe, it, expect, vi } from 'vitest';
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

  const stubs = {
    Dialog: {
      template: '<div><slot /></div>',
      props: ['open'],
      emits: ['update:open'],
    },
    DialogContent: { template: '<div><slot /></div>' },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
    DialogDescription: { template: '<div><slot /></div>' },
    DialogFooter: { template: '<div><slot /></div>' },
    DialogClose: { template: '<div><slot /></div>' },
    FieldGroup: { template: '<div><slot /></div>' },
    FieldLabel: { template: '<label><slot /></label>' },
    Input: {
      template:
        '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue'],
      emits: ['update:modelValue'],
    },
    Spinner: { template: '<div class="spinner"></div>' },
    Button: {
      template: '<button :disabled="disabled"><slot /></button>',
      props: ['disabled'],
    },
  };

  it('renders correctly with props', () => {
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain(defaultProps.title);
    expect(wrapper.text()).toContain(defaultProps.description);
    const button = wrapper.find('button[type="submit"]');
    expect(button.text()).toBe(defaultProps.submitLabel);
  });

  it('updates name when input changes', async () => {
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: defaultProps,
    });

    const input = wrapper.find('input');
    await input.setValue('New Week');

    const button = wrapper.find<HTMLButtonElement>('button[type="submit"]');
    expect(button.element.disabled).toBe(false);
  });

  it('disables submit button if name is empty or unchanged', async () => {
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: { ...defaultProps, initialName: 'Original' },
    });

    const button = wrapper.find<HTMLButtonElement>('button[type="submit"]');

    expect(button.element.disabled).toBe(true);

    const input = wrapper.find('input');
    await input.setValue('Changed');
    expect(button.element.disabled).toBe(false);

    await input.setValue('Original');
    expect(button.element.disabled).toBe(true);

    await input.setValue('   ');
    expect(button.element.disabled).toBe(true);
  });

  it('emits submit event with name when form is submitted', async () => {
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: defaultProps,
    });

    await wrapper.find('input').setValue('My New Week');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')![0]).toEqual(['My New Week']);
  });

  it('shows loading state in button', () => {
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: { ...defaultProps, isLoading: true },
    });

    const button = wrapper.find<HTMLButtonElement>('button[type="submit"]');
    expect(button.text()).toBe('Saving...');
    expect(button.element.disabled).toBe(true);
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('updates internal name when initialName prop changes', async () => {
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: defaultProps,
    });

    await wrapper.setProps({ initialName: 'New Initial' });
    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('New Initial');
  });

  it('updates internal name to empty string when initialName prop changes to falsy', async () => {
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: { ...defaultProps, initialName: 'Some Name' },
    });

    await wrapper.setProps({ initialName: undefined });
    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('emits update:modelValue when Dialog emits update:open', async () => {
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: { ...defaultProps, modelValue: true },
    });

    const dialog = wrapper.getComponent(stubs.Dialog);
    await dialog.vm.$emit('update:open', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('initializes name to empty string if initialName is undefined', () => {
    const { initialName, ...propsWithoutInitial } = defaultProps;
    const wrapper = mount(WeekFormDialog, {
      global: { stubs },
      props: propsWithoutInitial,
    });

    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('');
  });
});
