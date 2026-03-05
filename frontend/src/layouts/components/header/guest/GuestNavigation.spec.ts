import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import GuestNavigation from './GuestNavigation.vue';
import type { NavLink } from '../types/navigation';
import * as navigationMenuModule from '@/components/ui/navigation-menu';

vi.mock('@/components/ui/navigation-menu', async () => {
  const actual = await vi.importActual('@/components/ui/navigation-menu');
  return {
    ...actual,
    navigationMenuTriggerStyle: vi.fn(() => 'nav-trigger-style'),
  };
});

describe('GuestNavigation', () => {
  const mockNavigationMenuTriggerStyle = vi.mocked(navigationMenuModule.navigationMenuTriggerStyle);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = (links: NavLink[]) => {
    const wrapper = mount(GuestNavigation, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
      props: {
        links: links,
      },
    });

    return wrapper;
  };

  describe('Rendering', () => {
    it('renders with an empty links array', () => {
      const wrapper = mountComponent([]);
      expect(wrapper.findAllComponents(RouterLinkStub)).toHaveLength(0);
    });

    it('renders navigation links with one link', () => {
      const wrapper = mountComponent([{ label: 'test', to: '/' }]);
      const navLinks = wrapper.findAllComponents(RouterLinkStub);

      expect(navLinks).toHaveLength(1);
      expect(navLinks[0].props().to).toBe('/');
    });

    it('renders multiple navigation links in correct order', () => {
      const links: NavLink[] = [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/contact' },
      ];
      const wrapper = mountComponent(links);
      const navLinks = wrapper.findAllComponents(RouterLinkStub);

      expect(navLinks).toHaveLength(3);
      expect(navLinks[0].props('to')).toBe('/');
      expect(navLinks[1].props('to')).toBe('/about');
      expect(navLinks[2].props('to')).toBe('/contact');
    });
  });

  describe('Link Properties', () => {
    it('passes correct to prop to router-link', () => {
      const links: NavLink[] = [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Settings', to: '/settings' },
      ];
      const wrapper = mountComponent(links);
      const navLinks = wrapper.findAllComponents(RouterLinkStub);

      navLinks.forEach((link, index) => {
        expect(link.props('to')).toBe(links[index].to);
      });
    });

    it('renders correct label text for each link', () => {
      const links: NavLink[] = [
        { label: 'Features', to: '/features' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Docs', to: '/docs' },
      ];
      const wrapper = mountComponent(links);
      const navLinks = wrapper.findAllComponents(RouterLinkStub);

      navLinks.forEach((link, index) => {
        expect(link.text()).toContain(links[index].label);
      });
    });

    it('renders links with different URL formats', () => {
      const links: NavLink[] = [
        { label: 'Absolute', to: '/home' },
        { label: 'Hash', to: '#section' },
        { label: 'External', to: 'https://example.com' },
      ];
      const wrapper = mountComponent(links);
      const navLinks = wrapper.findAllComponents(RouterLinkStub);

      expect(navLinks[0].props('to')).toBe('/home');
      expect(navLinks[1].props('to')).toBe('#section');
      expect(navLinks[2].props('to')).toBe('https://example.com');
    });
  });

  describe('Function Calls', () => {
    it('calls navigationMenuTriggerStyle for each link', () => {
      const links: NavLink[] = [
        { label: 'Link 1', to: '/1' },
        { label: 'Link 2', to: '/2' },
      ];
      mountComponent(links);

      expect(mockNavigationMenuTriggerStyle).toHaveBeenCalledTimes(2);
    });

    it('calls navigationMenuTriggerStyle once for single link', () => {
      mountComponent([{ label: 'Single', to: '/' }]);

      expect(mockNavigationMenuTriggerStyle).toHaveBeenCalledTimes(1);
    });

    it('does not call navigationMenuTriggerStyle when links array is empty', () => {
      mountComponent([]);

      expect(mockNavigationMenuTriggerStyle).not.toHaveBeenCalled();
    });
  });
});
