import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from '../LoginPage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { accessToken, isAuthenticated, loginMutation } from '@/api/auth';
import { useMutation } from '@pinia/colada';
import { ref, computed } from 'vue';

// Mock auth API
vi.mock('@/api/auth', async () => {
  const { ref, computed } = await import('vue');
  const accessToken = ref(null);
  return {
    accessToken,
    isAuthenticated: computed(() => !!accessToken.value),
    loginMutation: vi.fn(),
  };
});

// Mock Pinia Colada
vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

describe('LoginPage', () => {
  let router: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (accessToken as any).value = null;

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: ROUTE_NAMES.HOME, component: { template: '<div>Home</div>' } },
        { path: '/login', name: ROUTE_NAMES.LOGIN, component: { template: '<div>Login</div>' } },
        {
          path: '/app/weeks',
          name: ROUTE_NAMES.WEEKS,
          component: { template: '<div>Weeks</div>' },
        },
        { path: '/signup', name: ROUTE_NAMES.SIGNUP, component: { template: '<div>Signup</div>' } },
        {
          path: '/forgot-password',
          name: ROUTE_NAMES.FORGOT_PASSWORD,
          component: { template: '<div>Forgot Password</div>' },
        },
      ],
    });
  });

  const mountComponent = () => {
    return mount(LoginPage, {
      global: {
        plugins: [router],
        stubs: {
          AuthCard: { template: '<div><slot name="header" /><slot /><slot name="footer" /></div>' },
          AuthFooter: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Spinner: { template: '<div class="spinner" />' },
          Input: {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
          },
          Field: { template: '<div><slot /></div>' },
          FieldGroup: { template: '<div><slot /></div>' },
          FieldLabel: { template: '<label><slot /></label>' },
          FieldSeparator: { template: '<div><slot /></div>' },
          FieldSet: { template: '<fieldset><slot /></fieldset>' },
          'router-link': true,
        },
      },
    });
  };

  it('renders login form when not authenticated', () => {
    (useMutation as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it('shows already logged in message when authenticated', async () => {
    (accessToken as any).value = 'token';
    (useMutation as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('You are already logged in');
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('disables login button when inputs are invalid', async () => {
    (useMutation as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mountComponent();
    const submitBtn = wrapper.find('button[type="submit"]');

    expect(submitBtn.attributes('disabled')).toBeDefined();

    await wrapper.find('input[type="email"]').setValue('test@example.com');
    expect(submitBtn.attributes('disabled')).toBeDefined(); // password still empty

    await wrapper.find('input[type="password"]').setValue('short');
    expect(submitBtn.attributes('disabled')).toBeDefined(); // password < 6 chars

    await wrapper.find('input[type="password"]').setValue('password123');
    expect(submitBtn.attributes('disabled')).toBeUndefined();
  });

  it('calls login mutation on form submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    (useMutation as any).mockReturnValue({
      mutateAsync,
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mountComponent();
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');

    await wrapper.find('form').trigger('submit.prevent');

    expect(mutateAsync).toHaveBeenCalled();
    const callArgs = mutateAsync.mock.calls[0][0];
    expect(callArgs.get('username')).toBe('test@example.com');
    expect(callArgs.get('password')).toBe('password123');
  });

  it('redirects to weeks page on successful login', async () => {
    const pushSpy = vi.spyOn(router, 'push');
    (useMutation as any).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mountComponent();
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');

    await wrapper.find('form').trigger('submit.prevent');

    expect(pushSpy).toHaveBeenCalledWith({ name: ROUTE_NAMES.WEEKS });
  });

  it('shows loading state during login', () => {
    (useMutation as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(true),
      error: ref(null),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('Logging in...');
  });
});
