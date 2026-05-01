import { describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import AppBrand from '../AppBrand.vue';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

describe('AppBrand', () => {
  const mountComponent = () =>
    mount(AppBrand, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });

  it('renders a link element', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('a').exists()).toBe(true);
  });

  it('links to the home page route', () => {
    const wrapper = mountComponent();
    expect(wrapper.findComponent(RouterLinkStub).props().to).toEqual({ name: ROUTE_NAMES.HOME });
  });

  it('renders the brand logo with correct alt text', () => {
    const wrapper = mountComponent();
    const logo = wrapper.find('img');
    expect(logo.exists()).toBe(true);
    expect(logo.attributes('alt')).toBe('Week Eat Planner logo');
  });

  it('renders the application name', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('h1').text()).toBe('Week Eat Planner');
  });
});
