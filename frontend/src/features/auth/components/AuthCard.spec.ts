import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthCard from './AuthCard.vue';

describe('AuthCard', () => {
  it('renders props correctly', () => {
    const wrapper = mount(AuthCard, {
      props: {
        eyebrow: 'Welcome back',
        title: 'Login to your account',
      },
      slots: {
        default: '<div class="test-slot">Slot Content</div>',
      },
    });

    expect(wrapper.text()).toContain('Welcome back');
    expect(wrapper.text()).toContain('Login to your account');
    expect(wrapper.find('.test-slot').exists()).toBe(true);
    expect(wrapper.find('.test-slot').text()).toBe('Slot Content');
  });

  it('has the correct CSS classes', () => {
    const wrapper = mount(AuthCard, {
      props: {
        eyebrow: 'test',
        title: 'test',
      },
    });

    expect(wrapper.classes()).toContain('auth-card');
  });
});
