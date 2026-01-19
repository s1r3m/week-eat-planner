import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AuthForm from '@/features/auth/components/AuthForm.vue';

describe('AuthForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it.each<{ variant: 'login' | 'signup'; buttonText: string; placeholder: string }>([
    { variant: 'login', buttonText: 'Login', placeholder: 'Minimum 6 characters' },
    { variant: 'signup', buttonText: 'Sign up', placeholder: 'Your password' },
  ])('renders variant %variant correctly', ({ variant, buttonText, placeholder }) => {
    const wrapper = mount(AuthForm, {
      props: {
        variant,
        submitting: false,
      },
      global: {
        stubs: ['router-link'],
      },
    });

    expect(wrapper.find('button[type="submit"]').text()).toBe(buttonText);
    expect(wrapper.find('#password').attributes('placeholder')).toBe(placeholder);
  });

  it('renders correctly for signup variant', () => {
    const wrapper = mount(AuthForm, {
      props: {
        variant: 'signup',
        submitting: false,
      },
      global: {
        stubs: ['router-link'],
      },
    });

    expect(wrapper.find('button[type="submit"]').text()).toBe('Sign up');
    expect(wrapper.find('#password').attributes('placeholder')).toBe('Your password');
  });

  it('emits submit event with email and password when form is submitted', async () => {
    const wrapper = mount(AuthForm, {
      props: {
        variant: 'login',
        submitting: false,
      },
      global: {
        stubs: ['router-link'],
      },
    });

    const emailInput = wrapper.find('#email');
    const passwordInput = wrapper.find('#password');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')![0]).toEqual(['test@example.com', 'password123']);
  });

  it('disables submit button if inputs are invalid', async () => {
    const wrapper = mount(AuthForm, {
      props: {
        variant: 'login',
        submitting: false,
      },
      global: {
        stubs: ['router-link'],
      },
    });

    const button = wrapper.find('button[type="submit"]');

    // Initial state (empty)
    expect((button.element as HTMLButtonElement).disabled).toBe(true);

    // Email only
    await wrapper.find('#email').setValue('test@example.com');
    expect((button.element as HTMLButtonElement).disabled).toBe(true);

    // Password too short
    await wrapper.find('#password').setValue('12345');
    expect((button.element as HTMLButtonElement).disabled).toBe(true);

    // Valid
    await wrapper.find('#password').setValue('123456');
    expect((button.element as HTMLButtonElement).disabled).toBe(false);
  });

  it.each<{ variant: 'login' | 'signup'; buttonText: string }>([
    { variant: 'login', buttonText: 'Logging in...' },
    { variant: 'signup', buttonText: 'Signing up...' },
  ])(
    'disables submit button if already processing the request. Variant: %variant',
    ({ variant, buttonText }) => {
      const wrapper = mount(AuthForm, {
        props: {
          variant,
          submitting: true,
        },
        global: {
          stubs: ['router-link'],
        },
      });
      const button = wrapper.find('button[type="submit"]');

      expect((button.element as HTMLButtonElement).disabled).toBe(true);
      expect(button.text()).toBe(buttonText);
    },
  );
});
