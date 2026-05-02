import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeInfoEdit from '../RecipeInfoEdit.vue';
import RecipeCover from '../RecipeCover.vue';

describe('RecipeInfoEdit', () => {
  beforeEach(() => {
    Object.defineProperty(window.URL, 'createObjectURL', {
      writable: true,
      value: vi.fn(() => 'mock-url'),
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      writable: true,
      value: vi.fn(),
    });
  });

  it('updates the cover alt via RecipeCover when name is changed', async () => {
    const wrapper = mount(RecipeInfoEdit, {
      props: {
        name: '',
        'onUpdate:name': (e: string) => wrapper.setProps({ name: e }),
      },
    });
    await wrapper.find('input#recipe-name').setValue('Carbonara');
    expect(wrapper.getComponent(RecipeCover).props('alt')).toBe('Carbonara');
  });

  it('creates an object URL and passes it as src to RecipeCover on file change', async () => {
    const wrapper = mount(RecipeInfoEdit, { props: { name: 'Test' } });
    const input = wrapper.find('input#recipe-cover');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input.element as HTMLInputElement, 'files', { value: [file] });
    await input.trigger('change');

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(wrapper.getComponent(RecipeCover).props('src')).toBe('mock-url');
  });

  it('revokes the previous object URL when a new file is selected', async () => {
    const wrapper = mount(RecipeInfoEdit, { props: { name: 'Test' } });
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

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(2);
  });

  it('does nothing when the file input is cleared', async () => {
    const wrapper = mount(RecipeInfoEdit, { props: { name: 'Test' } });
    const input = wrapper.find('input#recipe-cover');

    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [],
      configurable: true,
    });
    await input.trigger('change');

    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('revokes the object URL on unmount when an image is loaded', async () => {
    const wrapper = mount(RecipeInfoEdit, { props: { name: 'Test' } });
    const input = wrapper.find('input#recipe-cover');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [file],
      configurable: true,
    });
    await input.trigger('change');

    wrapper.unmount();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('does not revoke any URL on unmount when no image has been loaded', () => {
    const wrapper = mount(RecipeInfoEdit, { props: { name: 'Test' } });
    wrapper.unmount();
    expect(window.URL.revokeObjectURL).not.toHaveBeenCalled();
  });
});
