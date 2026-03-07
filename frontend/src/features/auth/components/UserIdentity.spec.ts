import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UserIdentity from './UserIdentity.vue';
import type { UserInfo } from '@/domain/auth/models';

describe('UserIdentity', () => {
  const user: UserInfo = {
    email: 'test@email.com',
    user_id: 'test',
    is_active: true,
  };
  it('renders the component with user email and placeholder name', () => {
    const wrapper = mount(UserIdentity, {
      props: { user: user },
    });

    expect(wrapper.text()).toContain(user.email);
    expect(wrapper.text()).toContain('test');
    expect(wrapper.text()).toContain('TE');
  });
});
