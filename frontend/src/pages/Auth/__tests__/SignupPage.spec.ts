import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SignupPage from '../SignupPage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { accessToken, isAuthenticated, loginMutation, signupMutation } from '@/api/auth';
import { useMutation } from '@pinia/colada';
import { ref, computed } from 'vue';

// Mock auth API
vi.mock('@/api/auth', async () => {
  const { ref, computed } = await import('vue');
  const accessToken = ref(null);
  const signupOptions = { mutation: vi.fn() };
  const loginOptions = { mutation: vi.fn() };
  return {
    accessToken,
    isAuthenticated: computed(() => !!accessToken.value),
    loginMutation: vi.fn(() => loginOptions),
    signupMutation: vi.fn(() => signupOptions),
  };
});

// Mock Pinia Colada
vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

describe('SignupPage', () => {
  let router: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (accessToken as any).value = null;

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: ROUTE_NAMES.HOME, component: { template: '<div>Home</div>' } },
        { path: '/signup', name: ROUTE_NAMES.SIGNUP, component: { template: '<div>Signup</div>' } },
        { path: '/login', name: ROUTE_NAMES.LOGIN, component: { template: '<div>Login</div>' } },
        {
          path: '/app/weeks',
          name: ROUTE_NAMES.WEEKS,
          component: { template: '<div>Weeks</div>' },
        },
      ],
    });
  });

  const mountComponent = () => {
    return mount(SignupPage, {
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

  it('renders signup form when not authenticated', () => {
    (useMutation as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[placeholder="Your username"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it('calls signup and then login mutation on form submit', async () => {
    const signupMutate = vi.fn().mockResolvedValue({});
    const loginMutate = vi.fn().mockResolvedValue({});

    (useMutation as any).mockImplementation((options: any) => {
      if (options === signupMutation()) {
        return { mutateAsync: signupMutate, isLoading: ref(false), error: ref(null) };
      }
      return { mutateAsync: loginMutate, isLoading: ref(false), error: ref(null) };
    });

    const wrapper = mountComponent();
    await wrapper.find('input[type="email"]').setValue('new@example.com');
    await wrapper.find('input[placeholder="Your username"]').setValue('newuser');
    await wrapper.find('input[type="password"]').setValue('password123');

    await wrapper.find('form').trigger('submit.prevent');

    expect(signupMutate).toHaveBeenCalledWith({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });
    expect(loginMutate).toHaveBeenCalled();
  });

  it('redirects to weeks page on successful signup and login', async () => {
    const signupMutate = vi.fn().mockResolvedValue({});
    const loginMutate = vi.fn().mockResolvedValue({});
    const pushSpy = vi.spyOn(router, 'push');

    (useMutation as any).mockImplementation((options: any) => {
      if (options === signupMutation()) {
        return { mutateAsync: signupMutate, isLoading: ref(false), error: ref(null) };
      }
      return { mutateAsync: loginMutate, isLoading: ref(false), error: ref(null) };
    });

    const wrapper = mountComponent();
    await wrapper.find('input[type="email"]').setValue('new@example.com');
    await wrapper.find('input[placeholder="Your username"]').setValue('newuser');
    await wrapper.find('input[type="password"]').setValue('password123');

    await wrapper.find('form').trigger('submit.prevent');

    expect(signupMutate).toHaveBeenCalled();
    expect(loginMutate).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalledWith({ name: ROUTE_NAMES.WEEKS });
  });
});
