import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AuthSignUpForm from '../AuthSignUpForm.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { useForm } from 'vee-validate';
import { ref } from 'vue';

vi.mock('@/api/auth', () => ({
  signupMutation: vi.fn(),
}));

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('vee-validate', () => ({
  useField: vi.fn(() => ({ value: ref('') })),
  useForm: vi.fn(() => ({
    handleSubmit: (cb: any) => (event: Event) => {
      event?.preventDefault?.();
      return cb({});
    },
    errors: ref({}),
    meta: ref({ valid: true }),
  })),
  toTypedSchema: vi.fn((schema) => schema),
}));

vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: vi.fn((schema) => schema),
}));

vi.mock('zod', async () => {
  const actual = await vi.importActual('zod');
  return { ...actual };
});

describe('AuthSignUpForm', () => {
  let router: any;

  beforeEach(() => {
    vi.clearAllMocks();
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: ROUTE_NAMES.HOME, component: { template: '<div>Home</div>' } },
        { path: '/login', name: ROUTE_NAMES.LOGIN, component: { template: '<div>Login</div>' } },
      ],
    });
  });

  const mountComponent = (props = {}) =>
    mount(AuthSignUpForm, {
      props,
      global: { plugins: [router] },
    });

  it('renders email, username, password inputs and a sign up button', () => {
    vi.mocked(useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    } as any);

    const wrapper = mountComponent();
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="button"]').text()).toBe('Sign up');
  });

  it('calls the signup mutation with the validated form values on submit', async () => {
    const signupMutate = vi.fn().mockResolvedValue({});
    vi.mocked(useMutation).mockReturnValue({
      mutateAsync: signupMutate,
      isLoading: ref(false),
      error: ref(null),
    } as any);

    vi.mocked(useForm).mockReturnValue({
      handleSubmit: (cb: any) => () =>
        cb({ email: 'new@example.com', username: 'newuser', password: 'password123' }),
      errors: ref({}),
      meta: ref({ valid: true }),
    } as any);

    const wrapper = mountComponent();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(signupMutate).toHaveBeenCalledWith({
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    });
  });

  it('shows a spinner and updated button text while loading', () => {
    vi.mocked(useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(true),
      error: ref(null),
    } as any);

    const wrapper = mountComponent();
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="button"]').text()).toContain('Signing up...');
  });

  it('displays the mutation error message when signup fails', () => {
    vi.mocked(useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(false),
      error: ref({ message: 'Signup failed' }),
    } as any);

    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Signup failed');
  });
});
