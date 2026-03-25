import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeInfoEdit from './RecipeInfoEdit.vue';
import RecipeCover from './RecipeCover.vue';

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

  it('updates name on input', async () => {
    const wrapper = mount(RecipeInfoEdit, {
      props: {
        name: '',
        'onUpdate:name': (e: string) => wrapper.setProps({ name: e }),
      },
    });
    const input = wrapper.find('input#recipe-name');
    await input.setValue('Carbonara');
    expect(wrapper.getComponent(RecipeCover).props('alt')).toBe('Carbonara');
  });

  it('handles file change', async () => {
    const wrapper = mount(RecipeInfoEdit, {
      props: {
        name: 'Test',
      },
    });
    const input = wrapper.find('input#recipe-cover');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    // Mocking files property
    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [file],
    });

    await input.trigger('change');

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(wrapper.getComponent(RecipeCover).props('src')).toBe('mock-url');
  });

  it('revokes old object URL when file changes', async () => {
    const wrapper = mount(RecipeInfoEdit, {
      props: {
        name: 'Test',
      },
    });
    const input = wrapper.find('input#recipe-cover');
    const file1 = new File([''], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File([''], 'test2.jpg', { type: 'image/jpeg' });

    // First file
    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [file1],
      configurable: true,
    });
    await input.trigger('change');
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);

    // Second file
    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [file2],
      configurable: true,
    });
    await input.trigger('change');

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(2);
  });

  it('does nothing if no files are selected', async () => {
    const wrapper = mount(RecipeInfoEdit, {
      props: {
        name: 'Test',
      },
    });
    const input = wrapper.find('input#recipe-cover');

    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [],
      configurable: true,
    });
    await input.trigger('change');

    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });
});
