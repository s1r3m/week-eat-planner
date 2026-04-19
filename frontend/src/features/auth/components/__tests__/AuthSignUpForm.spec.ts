import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthSignUpForm from '../AuthSignUpForm.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';

// Mock auth API
vi.mock('@/api/auth', () => ({
  signupMutation: vi.fn(),
  loginMutation: vi.fn(),
}));

// Mock Pinia Colada
vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

describe('AuthSignUpForm', () => {
  let router: any;

  beforeEach(() => {
    vi.clearAllMocks();

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: ROUTE_NAMES.HOME, component: { template: '<div>Home</div>' } },
        {
          path: '/app/weeks',
          name: ROUTE_NAMES.WEEKS,
          component: { template: '<div>Weeks</div>' },
        },
      ],
    });
  });

  const mountComponent = (props = {}) => {
    return mount(AuthSignUpForm, {
      props,
      global: {
        plugins: [router],
        stubs: {
          Button: {
            template: '<button :disabled="disabled" type="submit"><slot /></button>',
            props: ['disabled'],
          },
          Spinner: { template: '<div class="spinner" />' },
          Input: {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
          Field: { template: '<div><slot /></div>' },
          FieldGroup: { template: '<div><slot /></div>' },
          FieldLabel: { template: '<label><slot /></label>' },
          FieldSet: { template: '<fieldset><slot /></fieldset>' },
        },
      },
    });
  };

  it('renders signup form fields', () => {
    (useMutation as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input#username').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Sign up');
  });

  it('submits the form with correct values', async () => {
    const signupMutate = vi.fn().mockResolvedValue({ email: 'new@example.com' });
    const loginMutate = vi.fn().mockResolvedValue({ access_token: 'token' });
    const pushSpy = vi.spyOn(router, 'push');

    let mutationCounter = 0;
    (useMutation as any).mockImplementation(() => {
      mutationCounter++;
      if (mutationCounter === 1) {
        return { mutateAsync: signupMutate, isLoading: ref(false), error: ref(null) };
      }
      return { mutateAsync: loginMutate, isLoading: ref(false), error: ref(null) };
    });

    const wrapper = mountComponent();

    await wrapper.find('input[type="email"]').setValue('new@example.com');
    await wrapper.find('input#username').setValue('newuser');
    await wrapper.find('input[type="password"]').setValue('password123');

    // @ts-ignore
    await wrapper.vm.onSubmit();
    await flushPromises();

    expect(signupMutate).toHaveBeenCalled();
    expect(loginMutate).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalledWith({ name: ROUTE_NAMES.WEEKS });
  });

  it('shows loading state during submission', async () => {
    (useMutation as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: ref(true),
      error: ref(null),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('.spinner').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Signing up...');
  });

  it('shows error message when signup fails', async () => {
    const signupMutate = vi.fn().mockResolvedValue(undefined);

    (useMutation as any).mockReturnValue({
      mutateAsync: signupMutate,
      isLoading: ref(false),
      error: ref({ message: 'Signup failed' }),
    });

    const wrapper = mountComponent();

    await wrapper.find('input[type="email"]').setValue('error@example.com');
    await wrapper.find('input#username').setValue('user');
    await wrapper.find('input[type="password"]').setValue('password123');

    // @ts-ignore
    await wrapper.vm.onSubmit();
    await flushPromises();

    expect(signupMutate).toHaveBeenCalled();
    // We check for the error message in the text instead of spying on the internal function
    expect(wrapper.text()).toContain('Signup failed');
  });

  it('shows error when login fails after successful signup', async () => {
    const signupMutate = vi.fn().mockResolvedValue({ email: 'new@example.com' });
    const loginMutate = vi.fn().mockResolvedValue(undefined);
    const pushSpy = vi.spyOn(router, 'push');

    let mutationCounter = 0;
    (useMutation as any).mockImplementation(() => {
      mutationCounter++;
      if (mutationCounter === 1) {
        return { mutateAsync: signupMutate, isLoading: ref(false), error: ref(null) };
      }
      return {
        mutateAsync: loginMutate,
        isLoading: ref(false),
        error: ref({ message: 'Login failed' }),
      };
    });

    const wrapper = mountComponent();

    await wrapper.find('input[type="email"]').setValue('new@example.com');
    await wrapper.find('input#username').setValue('newuser');
    await wrapper.find('input[type="password"]').setValue('password123');

    // @ts-ignore
    await wrapper.vm.onSubmit();
    await flushPromises();

    expect(signupMutate).toHaveBeenCalled();
    expect(loginMutate).toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });
});
