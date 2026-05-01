import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UserIdentity from '../UserIdentity.vue';
import type { UserData } from '@/api/auth';

describe('UserIdentity', () => {
  const user: UserData = {
    email: 'test@email.com',
    user_id: 'testId',
    is_active: true,
  };

  it('shows email and derives initials and display name from the email prefix', () => {
    const wrapper = mount(UserIdentity, { props: { user } });

    expect(wrapper.text()).toContain(user.email);
    expect(wrapper.text()).toContain('test');
    expect(wrapper.text()).toContain('TE');
  });

  it('shows the provided username and its initials', () => {
    const wrapper = mount(UserIdentity, {
      props: { user: { ...user, username: 'Barry' } },
    });

    expect(wrapper.text()).toContain(user.email);
    expect(wrapper.text()).toContain('Barry');
    expect(wrapper.text()).toContain('BA');
  });

  it('renders the avatar image when avatar_url is provided', () => {
    const avatarUrl = 'http://test.com/url';
    const wrapper = mount(UserIdentity, {
      props: { user: { ...user, avatar_url: avatarUrl } },
    });

    expect(wrapper.text()).toContain(user.email);
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe(avatarUrl);
  });
});
