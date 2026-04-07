import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PageTitle from '../PageTitle.vue';

describe('PageTitle', () => {
  it('renders header and description', () => {
    const wrapper = mount(PageTitle, {
      props: {
        header: 'Test Header',
        description: 'This is a test description.',
      },
    });

    expect(wrapper.text()).toContain('Test Header');
    expect(wrapper.text()).toContain('This is a test description.');
  });

  it('renders only header when description is not provided', () => {
    const wrapper = mount(PageTitle, {
      props: {
        header: 'Only Header',
      },
    });

    expect(wrapper.text()).toContain('Only Header');
    expect(wrapper.find('#page-description').exists()).toBe(false);
  });

  it('renders loading state when header is not provided', () => {
    const wrapper = mount(PageTitle);

    expect(wrapper.text()).toContain('Loading...');
    expect(wrapper.findComponent({ name: 'Spinner' }).exists()).toBe(true);
  });
});
