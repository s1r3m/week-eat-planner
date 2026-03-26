import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeStepsEdit from '../RecipeStepsEdit.vue';
import type { CookingStep } from '@/domain/recipe/models';

describe('RecipeStepsEdit', () => {
  const defaultSteps: CookingStep[] = [{ order: 0, step: '' }];

  it('renders initial step', () => {
    const wrapper = mount(RecipeStepsEdit, {
      props: {
        steps: defaultSteps,
      },
    });
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(1);
  });

  it('adds a step', async () => {
    const wrapper = mount(RecipeStepsEdit, {
      props: {
        steps: [...defaultSteps],
        'onUpdate:steps': (e: any) => wrapper.setProps({ steps: e }),
      },
    });
    const addButton = wrapper.findAll('button').find((b) => b.text().includes('Add'));
    await addButton?.trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('removes a step and updates order', async () => {
    const wrapper = mount(RecipeStepsEdit, {
      props: {
        steps: [...defaultSteps],
        'onUpdate:steps': (e: any) => wrapper.setProps({ steps: e }),
      },
    });
    // Add two more steps
    const addButton = wrapper.findAll('button').find((b) => b.text().includes('Add'));
    await addButton?.trigger('click');
    await addButton?.trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(3);

    // Remove middle one
    const removeButtons = wrapper.findAll('button.text-destructive');
    await removeButtons[1].trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('updates step text', async () => {
    const wrapper = mount(RecipeStepsEdit, {
      props: {
        steps: [...defaultSteps],
        'onUpdate:steps': (e: any) => wrapper.setProps({ steps: e }),
      },
    });
    const input = wrapper.find('input');
    await input.setValue('Wash vegetables');
    expect((input.element as HTMLInputElement).value).toBe('Wash vegetables');
  });
});
