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

  it('renders the component with user email and placeholder name fallbacks', () => {
    const wrapper = mount(UserIdentity, {
      props: { user: user },
    });

    expect(wrapper.text()).toContain(user.email);
    expect(wrapper.text()).toContain('test');
    expect(wrapper.text()).toContain('TE');
  });

  it('renders the component with user email and given username', () => {
    const wrapper = mount(UserIdentity, {
      props: { user: { ...user, username: 'Barry' } },
    });

    expect(wrapper.text()).toContain(user.email);
    expect(wrapper.text()).toContain('Barry');
    expect(wrapper.text()).toContain('BA');
  });

  it('renders the component with user email and avatar', () => {
    const avatarUrl = 'http://test.com/url';
    const wrapper = mount(UserIdentity, {
      props: { user: { ...user, avatar_url: avatarUrl } },
    });

    expect(wrapper.text()).toContain(user.email);
    expect(wrapper.text()).toContain('test');

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe(avatarUrl);
  });
});
