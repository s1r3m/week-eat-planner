import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AuthForm from './AuthForm.vue';
import { useAuthStore } from '@/features/auth/store/auth';

describe('AuthForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders correctly when not logged in', () => {
    const wrapper = mount(AuthForm, {
      props: {
        variant: 'login',
        submitting: false,
      },
      global: {
        stubs: ['router-link'],
      },
    });

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('label[for="email"]').text()).toBe('Email');
    expect(wrapper.find('label[for="password"]').text()).toBe('Password');
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login');
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

  it('renders "already logged in" message when authStore has accessToken', () => {
    const authStore = useAuthStore();
    authStore.setAccessToken('fake-token');

    const wrapper = mount(AuthForm, {
      props: {
        variant: 'login',
        submitting: false,
      },
      global: {
        stubs: ['router-link'],
      },
    });

    expect(wrapper.find('form').exists()).toBe(false);
    expect(wrapper.text()).toContain('You are already logged in.');
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
});
