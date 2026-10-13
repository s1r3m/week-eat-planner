import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ErrorRetryCard from '../ErrorRetryCard.vue';

describe('ErrorRetryCard', () => {
  const error = new Error('Test error message');
  const mockRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () =>
    mount(ErrorRetryCard, {
      props: { error, retry: mockRetry },
    });

  it('renders the error message', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('An error has occurred');
    expect(wrapper.text()).toContain('Test error message');
  });

  it('calls the retry function when the button is clicked', async () => {
    const wrapper = mountComponent();
    await wrapper.find('button').trigger('click');
    expect(mockRetry).toHaveBeenCalled();
  });
});
