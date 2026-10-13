import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from '../LoginPage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

describe('LoginPage', () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/login', name: ROUTE_NAMES.LOGIN, component: { template: '<div>Login</div>' } },
      { path: '/signup', name: ROUTE_NAMES.SIGNUP, component: { template: '<div>Signup</div>' } },
      {
        path: '/forgot-password',
        name: ROUTE_NAMES.FORGOT_PASSWORD,
        component: { template: '<div>Forgot Password</div>' },
      },
    ],
  });

  const mountComponent = () => {
    return mount(LoginPage, {
      global: {
        plugins: [router],
        stubs: {
          AuthCard: { template: '<div class="auth-card"><slot /><slot name="footer" /></div>' },
          AuthLoginForm: { template: '<div class="login-form" />' },
          AuthSocialButtons: { template: '<div class="social-buttons" />' },
          FieldSeparator: { template: '<div class="separator"><slot /></div>' },
          CardDescription: { template: '<p><slot /></p>' },
        },
      },
    });
  };

  it('renders the login page with all components', () => {
    const wrapper = mountComponent();

    expect(wrapper.find('.auth-card').exists()).toBe(true);
    expect(wrapper.find('.login-form').exists()).toBe(true);
    expect(wrapper.find('.social-buttons').exists()).toBe(true);
    expect(wrapper.find('.separator').text()).toBe('Or');
  });

  it('contains a link to the signup page', () => {
    const wrapper = mountComponent();

    const signupLink = wrapper.find('a[href="/signup"]');

    expect(signupLink.exists()).toBe(true);
    expect(signupLink.text()).toContain('Register!');
  });

  it('contains a link to the forgot password page', () => {
    const wrapper = mountComponent();

    const forgotPasswordLink = wrapper.find('a[href="/forgot-password"]');

    expect(forgotPasswordLink.exists()).toBe(true);
    expect(forgotPasswordLink.text()).toContain('Reset it!');
  });
});
