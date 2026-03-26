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

  it('renders router-link as root', () => {
    const wrapper = mountComponent();
    const link = wrapper.find('a');

    expect(link.exists()).toBeTruthy();
  });

  it('navigates to the promo page', () => {
    const wrapper = mountComponent();
    const routerLink = wrapper.findComponent(RouterLinkStub);

    expect(routerLink.props().to).toEqual({ name: ROUTE_NAMES.HOME });
  });

  it('renders the brand logo', () => {
    const wrapper = mountComponent();
    const logo = wrapper.find('img');

    expect(logo.exists()).toBeTruthy();
    expect(logo.attributes('alt')).toBe('Week Eat Planner logo');
  });

  it('renders the application name', () => {
    const wrapper = mountComponent();
    const title = wrapper.find('h1');

    expect(title.exists()).toBeTruthy();
    expect(title.text()).toBe('Week Eat Planner');
  });
});
