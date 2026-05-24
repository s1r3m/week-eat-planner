import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import PasswordChangeForm from '../PasswordChangeForm.vue';
import { useMutation } from '@pinia/colada';
import type { UserData } from '@/api/user';

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/user', () => ({
  changePasswordMutation: vi.fn(() => ({})),
}));

describe('PasswordChangeForm', () => {
  const user: UserData = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    is_active: true,
    avatar_url: 'http://test.com/avatar',
    oauth_provider: null,
  };

  const oauthUser: UserData = {
    ...user,
    oauth_provider: 'google',
  };

  let mutateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateMock = vi.fn().mockResolvedValue({});
    (useMutation as any).mockReturnValue({ mutateAsync: mutateMock, isLoading: ref(false) });
  });

  const mountComponent = (modelValue: UserData = user) =>
    mount(PasswordChangeForm, {
      props: { modelValue },
    });

  it('renders the form correctly for a non-oauth user', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('input#old_pwd').exists()).toBe(true);
    expect((wrapper.find('input#old_pwd').element as HTMLInputElement).disabled).toBe(false);
  });

  it('disables inputs and shows provider message for an oauth user', () => {
    const wrapper = mountComponent(oauthUser);
    expect(wrapper.text()).toContain('The password is managed by google');
    expect((wrapper.find('input#old_pwd').element as HTMLInputElement).disabled).toBe(true);
    expect((wrapper.find('input#new_pwd').element as HTMLInputElement).disabled).toBe(true);
    expect((wrapper.find('input#confirm_pwd').element as HTMLInputElement).disabled).toBe(true);
  });

  it('calls mutate with passwords when submitted with valid data', async () => {
    const wrapper = mountComponent();

    await wrapper.find('input#old_pwd').setValue('oldpassword');
    await wrapper.find('input#new_pwd').setValue('newpassword');
    await wrapper.find('input#confirm_pwd').setValue('newpassword');

    await flushPromises();
    await wrapper.find('form#change-password-form').trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mutateMock).toHaveBeenCalledWith({
      old_password: 'oldpassword',
      new_password: 'newpassword',
    });
  });

  it('does not call mutate when passwords do not match', async () => {
    const wrapper = mountComponent();

    await wrapper.find('input#old_pwd').setValue('oldpassword');
    await wrapper.find('input#new_pwd').setValue('newpassword');
    await wrapper.find('input#confirm_pwd').setValue('differentpwd');

    await flushPromises();
    await wrapper.find('form#change-password-form').trigger('submit');

    await flushPromises();

    expect(mutateMock).not.toHaveBeenCalled();
  });
});
