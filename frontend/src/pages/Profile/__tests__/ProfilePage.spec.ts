import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProfilePage from '../ProfilePage.vue';
import { useQuery } from '@pinia/colada';
import { getUserQuery } from '@/api/auth';
import { ref } from 'vue';

// Mock API
vi.mock('@/api/auth', () => ({
  getUserQuery: vi.fn(),
}));

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
          Card: { template: '<div class="card"><slot name="header" /><slot /></div>' },
          CardHeader: { template: '<div class="card-header"><slot /></div>' },
          CardContent: { template: '<div class="card-content"><slot /></div>' },
          FieldSet: { template: '<fieldset><slot /></fieldset>' },
          FieldGroup: { template: '<div><slot /></div>' },
          Field: { template: '<div><slot /></div>' },
          FieldLabel: { template: '<label><slot /></label>' },
          FieldSeparator: { template: '<hr />' },
          Input: {
            template:
              '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'id'],
          },
          Checkbox: true,
          Label: true,
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
