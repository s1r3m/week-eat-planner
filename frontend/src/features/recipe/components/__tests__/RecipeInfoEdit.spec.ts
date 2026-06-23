import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RecipeInfoEdit from '../RecipeInfoEdit.vue';
import RecipeCover from '../RecipeCover.vue';
import { useForm } from 'vee-validate';
import { defineComponent } from 'vue';

const TestWrapper = defineComponent({
  components: { RecipeInfoEdit },
  props: {
    initialValues: { type: Object, required: true },
    initialImage: { type: String, default: null },
  },
  setup(props) {
    useForm({ initialValues: props.initialValues });
    return {};
  },
  template: '<RecipeInfoEdit :initial-image="initialImage" />',
});

describe('RecipeInfoEdit', () => {
  beforeEach(() => {
    Object.defineProperty(window.URL, 'createObjectURL', {
      writable: true,
      value: vi.fn(() => 'blob:mock-url'),
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      writable: true,
      value: vi.fn(),
    });
  });

  const initialValues = {
    name: '',
    image: null,
  };

  it('updates the cover alt via RecipeCover when name is changed', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues },
    });
    await flushPromises();
    await wrapper.find('input#recipe-name').setValue('Carbonara');
    expect(wrapper.getComponent(RecipeCover).props('alt')).toBe('Carbonara');
  });

  it('handles empty initialImage fallback', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues, initialImage: null },
    });
    await flushPromises();
    expect(wrapper.getComponent(RecipeCover).props('src')).toBe('');
  });

  it('updates img when initialImage prop changes and no cover is selected', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues, initialImage: 'initial.jpg' },
    });
    await flushPromises();
    expect(wrapper.getComponent(RecipeCover).props('src')).toBe('initial.jpg');

    await wrapper.setProps({ initialImage: 'updated.jpg' });
    await flushPromises();
    expect(wrapper.getComponent(RecipeCover).props('src')).toBe('updated.jpg');
  });

  it('does not update img when initialImage prop changes but a cover is already selected', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues, initialImage: 'initial.jpg' },
    });
    await flushPromises();

    // Select a file
    const input = wrapper.find('input#recipe-cover');
    const file = new File([''], 'local.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input.element as HTMLInputElement, 'files', { value: [file] });
    await input.trigger('change');
    const blobUrl = wrapper.getComponent(RecipeCover).props('src') as string;
    expect(blobUrl).toContain('blob:');

    // Change prop
    await wrapper.setProps({ initialImage: 'ignored.jpg' });
    await flushPromises();

    // Should still be the blob URL
    expect(wrapper.getComponent(RecipeCover).props('src')).toBe(blobUrl);
  });

  it('does not update img when initialImage prop changes to a falsy value', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues, initialImage: 'initial.jpg' },
    });
    await flushPromises();

    await wrapper.setProps({ initialImage: null });
    await flushPromises();

    expect(wrapper.getComponent(RecipeCover).props('src')).toBe('initial.jpg');
  });

  it('creates an object URL and passes it as src to RecipeCover on file change', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues: { ...initialValues, name: 'Test' } },
    });
    await flushPromises();
    const input = wrapper.find('input#recipe-cover');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input.element as HTMLInputElement, 'files', { value: [file] });
    await input.trigger('change');

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(wrapper.getComponent(RecipeCover).props('src')).toBe('blob:mock-url');
  });

  it('revokes the previous object URL when a new file is selected', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues: { ...initialValues, name: 'Test' } },
    });
    await flushPromises();
    const input = wrapper.find('input#recipe-cover');
    const file1 = new File([''], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File([''], 'test2.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [file1],
      configurable: true,
    });
    await input.trigger('change');

    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [file2],
      configurable: true,
    });
    await input.trigger('change');

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(2);
  });

  it('does nothing when the file input is cleared', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues: { ...initialValues, name: 'Test' } },
    });
    await flushPromises();
    const input = wrapper.find('input#recipe-cover');

    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [],
      configurable: true,
    });
    await input.trigger('change');

    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('revokes the object URL on unmount when an image is loaded', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues: { ...initialValues, name: 'Test' } },
    });
    await flushPromises();
    const input = wrapper.find('input#recipe-cover');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [file],
      configurable: true,
    });
    await input.trigger('change');

    wrapper.unmount();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('does not revoke any URL on unmount when no image has been loaded', async () => {
    const wrapper = mount(TestWrapper, {
      props: { initialValues: { ...initialValues, name: 'Test' } },
    });
    await flushPromises();
    wrapper.unmount();
    expect(window.URL.revokeObjectURL).not.toHaveBeenCalled();
  });
});
