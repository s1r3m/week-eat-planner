import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import AppBrand from '@/components/shared/AppBrand.vue';
import ModeToggle from '@/components/shared/ModeToggle.vue';
import GuestAppHeader from '../GuestAppHeader.vue';
import GuestNavigation from '../GuestNavigation.vue';
import GuestMobileMenu from '../GuestMobileMenu.vue';
import GuestAuthActions from '../GuestAuthActions.vue';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

describe('GuestAppHeader', () => {
  const mountComponent = () =>
    mount(GuestAppHeader, {
      global: {
        stubs: {
          AppHeader: {
            template:
              '<header><slot name="left" /><slot name="center" /><slot name="right" /></header>',
          },
          AppBrand: true,
          ModeToggle: true,
          GuestNavigation: true,
          GuestAuthActions: true,
          GuestMobileMenu: true,
        },
      },
    });

  it('renders the component', () => {
    expect(mountComponent().exists()).toBe(true);
  });

  it('renders AppBrand', () => {
    expect(mountComponent().findComponent(AppBrand).exists()).toBe(true);
  });

  it('renders ModeToggle', () => {
    expect(mountComponent().findComponent(ModeToggle).exists()).toBe(true);
  });

  it('renders GuestNavigation', () => {
    expect(mountComponent().findComponent(GuestNavigation).exists()).toBe(true);
  });

  it('renders GuestMobileMenu', () => {
    expect(mountComponent().findComponent(GuestMobileMenu).exists()).toBe(true);
  });

  it('renders GuestAuthActions', () => {
    expect(mountComponent().findComponent(GuestAuthActions).exists()).toBe(true);
  });

  it('passes navigation links to GuestNavigation', () => {
    const nav = mountComponent().findComponent(GuestNavigation);
    expect(nav.props('links')).toEqual([
      { to: { name: ROUTE_NAMES.HOME, hash: '#use-cases' }, label: 'Use Cases' },
      { to: { name: ROUTE_NAMES.HOME, hash: '#get-started' }, label: 'Get Started' },
      { to: { name: ROUTE_NAMES.WEEKS }, label: 'Start Planning' },
    ]);
  });

  it('passes navigation links to GuestMobileMenu', () => {
    const menu = mountComponent().findComponent(GuestMobileMenu);
    expect(menu.props('links')).toEqual([
      { to: { name: ROUTE_NAMES.HOME, hash: '#use-cases' }, label: 'Use Cases' },
      { to: { name: ROUTE_NAMES.HOME, hash: '#get-started' }, label: 'Get Started' },
      { to: { name: ROUTE_NAMES.WEEKS }, label: 'Start Planning' },
    ]);
  });
});
