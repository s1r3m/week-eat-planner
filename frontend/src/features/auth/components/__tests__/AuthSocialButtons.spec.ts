import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AuthSocialButtons from '../AuthSocialButtons.vue';
import { useMutation } from '@pinia/colada';
import { useGoogleAuth } from '@/features/auth/composables/useGoogleAuth';

vi.mock('@/features/auth/composables/useGoogleAuth', () => ({
  useGoogleAuth: vi.fn(),
}));

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  googleAuthMutation: vi.fn(),
}));

describe('AuthSocialButtons', () => {
  const requestCode = vi.fn();
  const createCodeClient = vi.fn();

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    requestCode.mockReset();
    createCodeClient.mockResolvedValue({ requestCode });
    vi.mocked(useGoogleAuth).mockReturnValue({ createCodeClient } as any);
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

  it('initializes the code client on mount with a callback that calls googleAuth', async () => {
    const googleAuth = vi.fn();
    vi.mocked(useMutation).mockReturnValue({ mutate: googleAuth } as any);
    mountComponent();
    await flushPromises();

    expect(createCodeClient).toHaveBeenCalledOnce();
    const callback = createCodeClient.mock.calls[0][0];
    callback({ code: 'auth-code-123' });
    expect(googleAuth).toHaveBeenCalledWith('auth-code-123');
  });

  it('calls requestCode on the code client when the Google button is clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const googleButton = wrapper.find('button:not([disabled])');
    await googleButton.trigger('click');

    expect(requestCode).toHaveBeenCalledOnce();
  });
});
