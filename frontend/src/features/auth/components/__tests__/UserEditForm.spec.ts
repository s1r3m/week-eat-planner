import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
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
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    is_active: true,
    avatar_url: 'http://test.com/avatar',
    oauth_provider: null,
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

  it('populates email and username inputs from the provided user model', async () => {
    const wrapper = mountComponent();

    expect((wrapper.find('input#email').element as HTMLInputElement).value).toBe(user.email);
    expect((wrapper.find('input#username').element as HTMLInputElement).value).toBe(user.username);

    // Trigger update on disabled email input for v-model coverage
    await wrapper.find('input#email').setValue('newemail@example.com');
  });

  it('disables the username input while a mutation is in flight', async () => {
    (useMutation as any).mockReturnValue({ mutate: mutateMock, isLoading: ref(true) });
    const wrapper = mountComponent();

    expect((wrapper.find('input#username').element as HTMLInputElement).disabled).toBe(true);
  });

  it('calls mutate with only the new username when the username has changed', async () => {
    const wrapper = mountComponent();

    await wrapper.find('input#username').setValue('changeduser');
    await flushPromises();
    await wrapper.find('form#profile-form').trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mutateMock).toHaveBeenCalledWith({ username: 'changeduser' });
  });

  it('does not call mutate when the username is unchanged', async () => {
    const wrapper = mountComponent();

    await wrapper.find('form#profile-form').trigger('submit');
    await flushPromises();

    // Since we are asserting it is NOT called, we don't want to use waitFor for positive assertion,
    // just wait a bit to ensure it wasn't called.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('re-populates the form when the user model changes', async () => {
    const wrapper = mountComponent();
    const updatedUser: UserData = { ...user, email: 'new@example.com', username: 'newuser' };

    await wrapper.setProps({ modelValue: updatedUser });
    await flushPromises();

    expect((wrapper.find('input#email').element as HTMLInputElement).value).toBe('new@example.com');
    expect((wrapper.find('input#username').element as HTMLInputElement).value).toBe('newuser');
  });

  it('disables the Save button when the username has not changed', () => {
    const wrapper = mountComponent();

    expect(wrapper.find('button[data-slot="button"]').attributes('disabled')).toBeDefined();
  });

  it('enables the Save button once the username is edited', async () => {
    const wrapper = mountComponent();

    await wrapper.find('input#username').setValue('changeduser');
    await flushPromises();

    expect(wrapper.find('button[data-slot="button"]').attributes('disabled')).toBeUndefined();
  });

  it('does not render the form when no user model is bound', () => {
    const wrapper = mount(UserEditForm);

    expect(wrapper.find('form#profile-form').exists()).toBe(false);
  });
});
