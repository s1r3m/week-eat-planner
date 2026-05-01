import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AuthSocialButtons from '../AuthSocialButtons.vue';
import { useMutation } from '@pinia/colada';

vi.mock('../composables/useGoogleAuth', () => ({
  useGoogleAuth: () => ({
    createCodeClient: vi.fn().mockResolvedValue({ requestCode: vi.fn() }),
  }),
}));

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  googleAuthMutation: vi.fn(),
}));

describe('AuthSocialButtons', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(useMutation).mockReturnValue({ mutate: vi.fn() } as any);
  });

  const mountComponent = () => mount(AuthSocialButtons);

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
