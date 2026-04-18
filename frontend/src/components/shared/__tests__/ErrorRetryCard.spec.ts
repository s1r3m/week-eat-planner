import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ErrorRetryCard from '../ErrorRetryCard.vue';

describe('ErrorRetryCard', () => {
  const error = new Error('Test error message');
  const mockRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () => {
    return mount(ErrorRetryCard, {
      props: {
        error,
        retry: mockRetry,
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          MessageCircleX: { template: '<div class="icon-stub" />' },
        },
      },
    });
  };

  it('renders error message', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('An error has occurred');
    expect(wrapper.text()).toContain('Test error message');
  });

  it('calls retry function when button is clicked', async () => {
    const wrapper = mountComponent();
    await wrapper.find('button').trigger('click');
    expect(mockRetry).toHaveBeenCalled();
  });
});
