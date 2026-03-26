import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import AppBrand from '@/components/shared/AppBrand.vue';
import ModeToggle from '@/components/shared/ModeToggle.vue';
import GuestAppHeader from '../GuestAppHeader.vue';
import GuestNavigation from '../GuestNavigation.vue';
import GuestMobileMenu from '../GuestMobileMenu.vue';
import GuestAuthActions from '../GuestAuthActions.vue';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

describe('GuestHeader', () => {
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

  describe('Rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent();
      expect(wrapper.exists()).toBe(true);
    });

    it('renders the logo component', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(AppBrand).exists()).toBe(true);
    });

    it('renders ModeToggle component', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(ModeToggle).exists()).toBe(true);
    });

    it('renders navigation menu', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(GuestNavigation).exists()).toBe(true);
    });

    it('renders mobile menu', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(GuestMobileMenu).exists()).toBe(true);
    });

    it('renders GuestAuthActions component', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent(GuestAuthActions).exists()).toBe(true);
    });
  });

  describe('Navigation Links', () => {
    it('passes default navigation links to GuestNavigation', () => {
      const wrapper = mountComponent();

      const navigation = wrapper.findComponent(GuestNavigation);

      expect(navigation.props('links')).toEqual([
        { to: { name: ROUTE_NAMES.HOME, hash: '#use-cases' }, label: 'Use Cases' },
        { to: { name: ROUTE_NAMES.HOME, hash: '#get-started' }, label: 'Get Started' },
        { to: { name: ROUTE_NAMES.WEEKS }, label: 'Start Planning' },
      ]);
    });

    it('passes default navigation links to GuestMobileMenu', () => {
      const wrapper = mountComponent();

      const mobileMenu = wrapper.findComponent(GuestMobileMenu);

      expect(mobileMenu.props('links')).toEqual([
        { to: { name: ROUTE_NAMES.HOME, hash: '#use-cases' }, label: 'Use Cases' },
        { to: { name: ROUTE_NAMES.HOME, hash: '#get-started' }, label: 'Get Started' },
        { to: { name: ROUTE_NAMES.WEEKS }, label: 'Start Planning' },
      ]);
    });
  });
});
