import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AuthSocialButtons from '../AuthSocialButtons.vue';

vi.mock('../composables/useGoogleAuth', () => ({
  useGoogleAuth: () => ({
    createCodeClient: vi.fn().mockResolvedValue({
      requestCode: vi.fn(),
    }),
  }),
}));

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
  }),
}));

vi.mock('@/api/auth', () => ({
  googleAuthMutation: vi.fn(),
}));

describe('AuthSocialButtons', () => {
  const mountComponent = () => {
    setActivePinia(createPinia());
    return mount(AuthSocialButtons, {
      global: {
        stubs: {
          Button: {
            template:
              '<button :disabled="disabled" variant="outline" class="w-full"><slot /></button>',
            props: ['disabled', 'variant'],
          },
        },
      },
    });
  };

  it('renders the OAuth container', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('#oauth-container').exists()).toBe(true);
  });

  it('renders Google and Facebook buttons', () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAll('button');

    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toContain('Google');
    expect(buttons[1].text()).toContain('Facebook');
  });

  it('renders Google enabled and Facebook disabled', () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAll('button');

    expect(buttons[0].attributes('disabled')).toBeUndefined();
    expect(buttons[1].attributes('disabled')).toBeDefined();
  });
});
