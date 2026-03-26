import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AuthFooter from '../AuthFooter.vue';

describe('AuthFooter', () => {
  it('should render the component no slots', () => {
    const wrapper = mount(AuthFooter);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Continue with Google');
    expect(wrapper.text()).toContain('Continue with Facebook');
  });

  it('should render the slot correctly', () => {
    const wrapper = mount(AuthFooter, {
      slots: {
        default: '<div class="links">Footer Content</div>',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.links').exists()).toBe(true);
    expect(wrapper.text()).toContain('Footer Content');
  });
});
