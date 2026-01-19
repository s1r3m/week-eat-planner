import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthCard from '@/features/auth/components/AuthCard.vue';

describe('AuthCard', () => {
  it('renders props correctly', () => {
    const wrapper = mount(AuthCard, {
      props: {
        title: 'Welcome back',
        description: 'Login to your account',
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

  it('renders slots correctly', () => {
    const wrapper = mount(AuthCard, {
      props: {
        title: 'test',
        description: 'test',
      },
      slots: {
        default: '<div class="default-slot">Default Slot</div>',
        footer: '<div class="footer-slot">Footer Slot</div>',
      },
    });

    expect(wrapper.find('.default-slot').exists()).toBe(true);
    expect(wrapper.find('.default-slot').text()).toBe('Default Slot');
    expect(wrapper.find('.footer-slot').exists()).toBe(true);
    expect(wrapper.find('.footer-slot').text()).toBe('Footer Slot');
  });
});
