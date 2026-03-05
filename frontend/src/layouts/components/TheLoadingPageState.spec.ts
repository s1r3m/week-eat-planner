import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TheLoadingPageState from './TheLoadingPageState.vue';

describe('TheLoadingPageState', () => {
  it('renders default component', () => {
    const wrapper = mount(TheLoadingPageState);

    expect(wrapper.html()).toContain('Loading data...');
  });

  it('renders with props', () => {
    const wrapper = mount(TheLoadingPageState, {
      props: {
        loadingName: 'test pages',
      },
    });

    expect(wrapper.html()).toContain('Loading test pages...');
  });
});
