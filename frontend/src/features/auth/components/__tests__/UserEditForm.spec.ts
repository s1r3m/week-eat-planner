import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import UserEditForm from '../UserEditForm.vue';
import { useMutation } from '@pinia/colada';
import type { UserData } from '@/api/user';

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@/api/user', () => ({
  updateUserMutation: vi.fn(() => ({})),
}));

describe('UserEditForm', () => {
  const user: UserData = {
    user_id: '1',
    email: 'test@example.com',
    username: 'testuser',
    is_active: true,
  };

  let mutateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateMock = vi.fn();
    (useMutation as any).mockReturnValue({ mutate: mutateMock, isLoading: ref(false) });
  });

  const mountComponent = (modelValue: UserData = user) =>
    mount(UserEditForm, {
      props: { modelValue },
    });

  it('populates email and username inputs from the provided user model', () => {
    const wrapper = mountComponent();

    expect((wrapper.find('input#email').element as HTMLInputElement).value).toBe(user.email);
    expect((wrapper.find('input#username').element as HTMLInputElement).value).toBe(user.username);
  });

  it('disables all inputs while a mutation is in flight', async () => {
    (useMutation as any).mockReturnValue({ mutate: mutateMock, isLoading: ref(true) });
    const wrapper = mountComponent();

    expect((wrapper.find('input#email').element as HTMLInputElement).disabled).toBe(true);
    expect((wrapper.find('input#username').element as HTMLInputElement).disabled).toBe(true);
  });

  it('calls mutate with the current form values when the form is submitted', async () => {
    const wrapper = mountComponent();

    await wrapper.find('form#profile-form').trigger('submit');

    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({ email: user.email, username: user.username }));
  });

  it('re-populates the form when the user model changes', async () => {
    const wrapper = mountComponent();
    const updatedUser: UserData = { ...user, email: 'new@example.com', username: 'newuser' };

    await wrapper.setProps({ modelValue: updatedUser });

    expect((wrapper.find('input#email').element as HTMLInputElement).value).toBe('new@example.com');
    expect((wrapper.find('input#username').element as HTMLInputElement).value).toBe('newuser');
  });

  it('updates the form state when the user edits the email or username fields', async () => {
    const wrapper = mountComponent();

    await wrapper.find('input#email').setValue('changed@example.com');
    await wrapper.find('input#username').setValue('changeduser');

    expect((wrapper.find('input#email').element as HTMLInputElement).value).toBe('changed@example.com');
    expect((wrapper.find('input#username').element as HTMLInputElement).value).toBe('changeduser');
  });

  it('does not call mutate when the form is submitted with no user model bound', async () => {
    const wrapper = mount(UserEditForm);

    await wrapper.find('#profle-form-container').trigger('submit');

    expect(mutateMock).not.toHaveBeenCalled();
  });
});
