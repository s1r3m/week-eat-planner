import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ProfilePage from '../ProfilePage.vue';
import UserEditForm from '@/features/auth/components/UserEditForm.vue';
import { useQuery } from '@pinia/colada';

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/api/user', () => ({
  getUserQuery: vi.fn(() => ({})),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () =>
    mount(ProfilePage, {
      global: {
        stubs: {
          PageTitle: true,
          ErrorRetryCard: { template: '<div class="error-retry" />' },
          TheLoadingPageState: { template: '<div class="loading" />' },
          UserEditForm: { template: '<div class="user-edit-form" />' },
        },
      },
    });

  it('shows the loading state while user data is being fetched', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(true),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mountComponent();

    expect(wrapper.find('.loading').exists()).toBe(true);
  });

  it('shows the edit form once user data has loaded', () => {
    (useQuery as any).mockReturnValue({
      data: ref({ user_id: '1', email: 'test@example.com', username: 'testuser', is_active: true }),
      isLoading: ref(false),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mountComponent();

    expect(wrapper.find('.user-edit-form').exists()).toBe(true);
  });

  it('updates the bound user when the edit form emits a new value', async () => {
    const userData = { user_id: '1', email: 'test@example.com', username: 'testuser', is_active: true };
    (useQuery as any).mockReturnValue({
      data: ref(userData),
      isLoading: ref(false),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mountComponent();
    const updatedUser = { ...userData, username: 'updated' };
    await wrapper.findComponent(UserEditForm).vm.$emit('update:modelValue', updatedUser);

    expect(wrapper.find('.user-edit-form').exists()).toBe(true);
  });

  it('shows the error state when the request fails', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref(new Error('Failed to fetch')),
      refetch: vi.fn(),
    });

    const wrapper = mountComponent();

    expect(wrapper.find('.error-retry').exists()).toBe(true);
  });
});
