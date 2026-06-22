import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeStepsEdit from '../RecipeStepsEdit.vue';
import type { CookingStep } from '@/api/recipes';

describe('RecipeStepsEdit', () => {
  const defaultSteps: CookingStep[] = [{ order: 0, step: '' }];

  it('renders the initial step', () => {
    const wrapper = mount(RecipeStepsEdit, { props: { steps: defaultSteps } });
    expect(wrapper.findAll('li')).toHaveLength(1);
  });

  it('adds a step automatically when the last one is filled', async () => {
    const wrapper = mount(RecipeStepsEdit, {
      props: {
        steps: [...defaultSteps],
        'onUpdate:steps': (e: any) => wrapper.setProps({ steps: e }),
      },
    });
    expect(wrapper.findAll('li')).toHaveLength(1);
    const input = wrapper.find('input');
    await input.setValue('Wash vegetables');
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('removes a step when the remove button is clicked', async () => {
    const wrapper = mount(RecipeStepsEdit, {
      props: {
        steps: [...defaultSteps],
        'onUpdate:steps': (e: any) => wrapper.setProps({ steps: e }),
      },
    });
    // Add steps by filling them
    await wrapper.findAll('input')[0].setValue('Step 1');
    await wrapper.findAll('input')[1].setValue('Step 2');
    expect(wrapper.findAll('li')).toHaveLength(3);

    const removeButtons = wrapper.findAll('button.text-destructive');
    await removeButtons[0].trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('updates step text on input', async () => {
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
