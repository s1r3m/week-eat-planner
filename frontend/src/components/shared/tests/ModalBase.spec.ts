import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ModalBase from '@/components/shared/ModalBase.vue';

describe('ModalBase', () => {
  it.each([
    { props: { title: 'Test Modal' }, expectedId: 'modal-title' },
    { props: { subtitle: 'Test Modal' }, expectedId: 'modal-subtitle' },
    { props: { eyebrow: 'Test Modal' }, expectedId: 'modal-eyebrow' },
  ])('should render correctly with optional props: %props', ({ props, expectedId }) => {
    const wrapper = mount(ModalBase, {
      props: {
        modelValue: true,
        ...props,
      },
    });
    expect(wrapper.find(`#${expectedId}`).exists()).toBe(true);
  });
});
