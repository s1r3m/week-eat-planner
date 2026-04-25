import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthLoginForm from '../AuthLoginForm.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useMutation } from '@pinia/colada';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';

// Mock auth API
vi.mock('@/api/auth', () => ({
  loginMutation: vi.fn(),
}));

// Mock Pinia Colada
vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

// Mock vee-validate
vi.mock('vee-validate', () => ({
  useField: vi.fn(() => ({ value: ref('') })),
  useForm: vi.fn(() => ({
    handleSubmit: (cb: any) => (event: Event) => {
      // Prevent default to stop native form submission
      event?.preventDefault?.();
      // Extract values from the form's native inputs if available
      const form = event?.target as HTMLFormElement;
      let values: Record<string, string> = {};

      if (form) {
        const formData = new FormData(form);
        for (const [key, value] of formData.entries()) {
          values[key] = value as string;
        }
      }

      // If no form values, try to get from component state via the event
      // This is a fallback for when using custom inputs (like Input component)
      if (!values.email && !values.password) {
        const submitter = (event as any)?.submitter;
        // Try to get values from the wrapper's vm if available
      }

      return cb(values);
    },
    errors: ref({}),
    meta: ref({ valid: true }),
  })),
  toTypedSchema: vi.fn((schema) => schema),
}));

// Mock @vee-validate/zod
vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: vi.fn((schema) => schema),
}));

// Mock zod
vi.mock('zod', async () => {
  const actual = await vi.importActual('zod');
  return {
    ...actual,
  };
});

describe('AuthLoginForm', () => {
  let router: any;

  beforeEach(() => {
    vi.clearAllMocks();

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: ROUTE_NAMES.HOME, component: { template: '<div>Home</div>' } },
        {
          path: '/login',
          name: ROUTE_NAMES.LOGIN,
          component: { template: '<div>Login</div>' },
        },
      ],
    });
  });

  const mountComponent = (props = {}) => {
    return mount(AuthLoginForm, {
      props,
      global: {
        plugins: [router],
        stubs: {
          Button: {
            template: '<button type="submit"><slot /></button>',
          },
          Spinner: { template: '<div class="spinner" />' },
          Input: {
            template:
              '<input :id="id" :name="id" :value="modelValue" :type="type" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\', $event)" />',
            props: ['modelValue', 'id', 'type', 'placeholder'],
            emits: ['update:modelValue', 'blur'],
          },
          Field: { template: '<div><slot /></div>' },
          FieldGroup: { template: '<div><slot /></div>' },
          FieldLabel: { template: '<label><slot /></label>' },
          FieldSet: { template: '<fieldset><slot /></fieldset>' },
          FieldError: { template: '<div class="field-error"><slot /></div>' },
        },
      },
    });
  };

  it('renders login form fields', () => {
    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isLoading: ref(false),
      error: ref(null),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input#email').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('input#password').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Login');
  });

  it('submits the form with correct values', async () => {
    const loginMutate = vi.fn().mockResolvedValue({ email: 'user@example.com' });

    (useMutation as any).mockImplementation(() => {
      return { mutate: loginMutate, isLoading: ref(false), error: ref(null) };
    });

    const wrapper = mountComponent();
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    await emailInput.setValue('user@example.com');
    await passwordInput.setValue('password123');

    // Trigger input events to update v-model
    await emailInput.trigger('input');
    await passwordInput.trigger('input');

    // Force vee-validate to validate
    await wrapper.vm.$nextTick();

    // Submit the form via the DOM
    const form = wrapper.find('form');
    await form.trigger('submit.prevent', {
      submitter: wrapper.find('button[type="submit"]').element,
    });
    await flushPromises();

    expect(loginMutate).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('shows loading state during submission', () => {
    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isLoading: ref(true),
      error: ref(null),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('.spinner').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Logging in...');
  });

  it('shows error message when login fails', () => {
    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isLoading: ref(false),
      error: ref({ message: 'Invalid credentials' }),
    });

    const wrapper = mountComponent();
    // Error is rendered at FieldSet level in a FieldError component
    expect(wrapper.find('form').text()).toContain('Invalid credentials');
  });

  it('disables submit button when form is invalid or loading', async () => {
    const isLoading = ref(false);
    const meta = ref({ valid: false });

    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isLoading,
      error: ref(null),
    });

    (useForm as any).mockReturnValue({
      handleSubmit: vi.fn(),
      errors: ref({}),
      meta,
    });

    const wrapper = mountComponent();
    const button = wrapper.find('button[type="submit"]');

    // 1. Assert disabled when form is invalid
    expect(button.attributes('disabled')).toBeDefined();

    // 2. Assert enabled when form is valid
    meta.value.valid = true;
    await wrapper.vm.$nextTick();
    expect(button.attributes('disabled')).toBeUndefined();

    // 3. Assert disabled when loading
    isLoading.value = true;
    await wrapper.vm.$nextTick();
    expect(button.attributes('disabled')).toBeDefined();
  });
});
