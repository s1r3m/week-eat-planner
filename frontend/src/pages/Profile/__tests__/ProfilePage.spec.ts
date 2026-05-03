import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProfilePage from '../ProfilePage.vue';
import { useQuery } from '@pinia/colada';
import { ref } from 'vue';

// Mock Pinia Colada
vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn(),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () => {
    return mount(ProfilePage, {
      global: {
        stubs: {
          PageTitle: true,
          ErrorRetryCard: { template: '<div class="error-retry" />' },
          TheLoadingPageState: { template: '<div class="loading" />' },
        },
      },
    });
  };

  it('renders loading state', () => {
    (useQuery as any).mockReturnValue({
      data: ref(null),
      isLoading: ref(true),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('.loading').exists()).toBe(true);
  });

  it('renders user data when loaded', async () => {
    const userData = {
      user_id: '1',
      email: 'test@example.com',
      username: 'testuser',
      is_active: true,
    };
    (useQuery as any).mockReturnValue({
      data: ref(userData),
      isLoading: ref(false),
      error: ref(null),
      refetch: vi.fn(),
    });

    const wrapper = mountComponent();
    expect(wrapper.find('input#email').exists()).toBe(true);
    expect(wrapper.find('input#username').exists()).toBe(true);
    await wrapper.vm.$nextTick();
    expect((wrapper.find('input#email').element as HTMLInputElement).value).toBe(
      'test@example.com',
    );
    expect((wrapper.find('input#username').element as HTMLInputElement).value).toBe('testuser');
  });

  it('renders error state', () => {
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
