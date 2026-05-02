import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AuthLoginForm from '../AuthLoginForm.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

vi.mock('@/api/auth', () => ({
  loginMutation: vi.fn(),
}));

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('vee-validate', () => ({
  useField: vi.fn(() => ({ value: ref('') })),
  useForm: vi.fn(() => ({
    handleSubmit: (cb: any) => (event: Event) => {
      event?.preventDefault?.();
      const form = event?.target as HTMLFormElement;
      const values: Record<string, string> = {};
      if (form) {
        const formData = new FormData(form);
        for (const [key, value] of formData.entries()) {
          values[key] = value as string;
        }
      }
      return cb(values);
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

describe('AuthLoginForm', () => {
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
    mount(AuthLoginForm, {
      props,
      global: {
        plugins: [router],
      },
    });

  it('renders email, password inputs and a login button', () => {
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    } as any);

    const wrapper = mountComponent();
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="button"]').text()).toBe('Login');
  });

  it('calls the login mutation with the validated form values on submit', async () => {
    const loginMutate = vi.fn().mockResolvedValue({});
    vi.mocked(useMutation).mockReturnValue({
      mutate: loginMutate,
      isLoading: ref(false),
      error: ref(null),
    } as any);

    vi.mocked(useForm).mockReturnValue({
      handleSubmit: (cb: any) => () => cb({ email: 'user@example.com', password: 'password123' }),
      errors: ref({}),
      meta: ref({ valid: true }),
    } as any);

    const wrapper = mountComponent();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(loginMutate).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('shows a spinner and updated button text while loading', () => {
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: ref(true),
      error: ref(null),
    } as any);

    const wrapper = mountComponent();
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot="button"]').text()).toContain('Logging in...');
  });

  it('displays the mutation error message when login fails', () => {
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: ref(false),
      error: ref({ message: 'Invalid credentials' }),
    } as any);

    const wrapper = mountComponent();
    expect(wrapper.find('form').text()).toContain('Invalid credentials');
  });

  it('updates the email and password fields when the user types', async () => {
    const emailRef = ref('');
    const passwordRef = ref('');
    vi.mocked(useField)
      .mockReturnValueOnce({ value: emailRef } as any)
      .mockReturnValueOnce({ value: passwordRef } as any);
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    } as any);

    const wrapper = mountComponent();
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('secret123');

    expect(emailRef.value).toBe('user@example.com');
    expect(passwordRef.value).toBe('secret123');
  });

  it('disables the submit button when the form is invalid or loading', async () => {
    const isLoading = ref(false);
    const meta = ref({ valid: false });

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading,
      error: ref(null),
    } as any);

    vi.mocked(useForm).mockReturnValue({
      handleSubmit: vi.fn(),
      errors: ref({}),
      meta,
    } as any);

    const wrapper = mountComponent();
    const button = wrapper.find('[data-slot="button"]');

    expect(button.attributes('disabled')).toBeDefined();

    meta.value.valid = true;
    await wrapper.vm.$nextTick();
    expect(button.attributes('disabled')).toBeUndefined();

    isLoading.value = true;
    await wrapper.vm.$nextTick();
    expect(button.attributes('disabled')).toBeDefined();
  });
});
