import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SignupPage from '../SignupPage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

describe('SignupPage', () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/login', name: ROUTE_NAMES.LOGIN, component: { template: '<div>Login</div>' } },
      { path: '/signup', name: ROUTE_NAMES.SIGNUP, component: { template: '<div>Signup</div>' } },
    ],
  });

  const mountComponent = () => {
    return mount(SignupPage, {
      global: {
        plugins: [router],
        stubs: {
          AuthCard: { template: '<div class="auth-card"><slot /><slot name="footer" /></div>' },
          AuthSignUpForm: { template: '<div class="signup-form" />' },
          AuthSocialButtons: { template: '<div class="social-buttons" />' },
          FieldSeparator: { template: '<div class="separator"><slot /></div>' },
          CardDescription: { template: '<p><slot /></p>' },
        },
      },
    });
  };

  it('renders the signup page with all components', () => {
    const wrapper = mountComponent();

    expect(wrapper.find('.auth-card').exists()).toBe(true);
    expect(wrapper.find('.signup-form').exists()).toBe(true);
    expect(wrapper.find('.social-buttons').exists()).toBe(true);
    expect(wrapper.find('.separator').text()).toBe('Or');
  });

  it('contains a link to the login page', () => {
    const wrapper = mountComponent();
    const loginLink = wrapper.find('a');

    expect(loginLink.exists()).toBe(true);
    expect(loginLink.attributes('href')).toBe('/login');
    expect(loginLink.text()).toContain('Log in!');
  });
});
