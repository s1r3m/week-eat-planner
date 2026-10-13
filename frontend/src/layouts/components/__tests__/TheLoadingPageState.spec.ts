import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TheLoadingPageState from '../TheLoadingPageState.vue';

describe('TheLoadingPageState', () => {
  it('renders with the default loading name', () => {
    expect(mount(TheLoadingPageState).html()).toContain('Loading data...');
  });

  it('renders with a custom loading name', () => {
    const wrapper = mount(TheLoadingPageState, { props: { loadingName: 'test pages' } });
    expect(wrapper.html()).toContain('Loading test pages...');
  });
});
