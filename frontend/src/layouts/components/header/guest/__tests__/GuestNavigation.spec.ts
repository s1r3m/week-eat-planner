import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import GuestNavigation from '../GuestNavigation.vue';
import type { NavLink } from '../../types/navigation';
import * as navigationMenuModule from '@/components/ui/navigation-menu';

vi.mock('@/components/ui/navigation-menu', async () => {
  const actual = await vi.importActual('@/components/ui/navigation-menu');
  return { ...actual, navigationMenuTriggerStyle: vi.fn(() => 'nav-trigger-style') };
});

describe('GuestNavigation', () => {
  const mockNavigationMenuTriggerStyle = vi.mocked(navigationMenuModule.navigationMenuTriggerStyle);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = (links: NavLink[]) =>
    mount(GuestNavigation, {
      props: { links },
      global: { stubs: { RouterLink: RouterLinkStub } },
    });

  describe('rendering', () => {
    it('renders no links when the array is empty', () => {
      expect(mountComponent([]).findAllComponents(RouterLinkStub)).toHaveLength(0);
    });

    it('renders a link for each item in the array', () => {
      const links: NavLink[] = [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/contact' },
      ];
      const navLinks = mountComponent(links).findAllComponents(RouterLinkStub);
      expect(navLinks).toHaveLength(3);
      expect(navLinks[0].props('to')).toBe('/');
      expect(navLinks[1].props('to')).toBe('/about');
      expect(navLinks[2].props('to')).toBe('/contact');
    });

    it('renders the correct label text for each link', () => {
      const links: NavLink[] = [
        { label: 'Features', to: '/features' },
        { label: 'Pricing', to: '/pricing' },
      ];
      const navLinks = mountComponent(links).findAllComponents(RouterLinkStub);
      navLinks.forEach((link, i) => expect(link.text()).toContain(links[i].label));
    });

    it('renders links with different URL formats', () => {
      const links: NavLink[] = [
        { label: 'Absolute', to: '/home' },
        { label: 'Hash', to: '#section' },
        { label: 'External', to: 'https://example.com' },
      ];
      const navLinks = mountComponent(links).findAllComponents(RouterLinkStub);
      expect(navLinks[0].props('to')).toBe('/home');
      expect(navLinks[1].props('to')).toBe('#section');
      expect(navLinks[2].props('to')).toBe('https://example.com');
    });
  });

  describe('navigationMenuTriggerStyle calls', () => {
    it('calls navigationMenuTriggerStyle once per link', () => {
      mountComponent([
        { label: 'Link 1', to: '/1' },
        { label: 'Link 2', to: '/2' },
      ]);
      expect(mockNavigationMenuTriggerStyle).toHaveBeenCalledTimes(2);
    });

    it('does not call navigationMenuTriggerStyle when the links array is empty', () => {
      mountComponent([]);
      expect(mockNavigationMenuTriggerStyle).not.toHaveBeenCalled();
    });
  });
});
