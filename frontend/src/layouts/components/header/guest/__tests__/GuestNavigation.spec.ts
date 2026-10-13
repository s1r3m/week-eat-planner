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
        { label: 'Home', to: { name: 'home' } },
        { label: 'About', to: { name: 'about' } },
        { label: 'Contact', to: { name: 'contact' } },
      ];
      const navLinks = mountComponent(links).findAllComponents(RouterLinkStub);
      expect(navLinks).toHaveLength(3);
      expect(navLinks[0].props('to')).toEqual({ name: 'home' });
      expect(navLinks[1].props('to')).toEqual({ name: 'about' });
      expect(navLinks[2].props('to')).toEqual({ name: 'contact' });
    });

    it('renders the correct label text for each link', () => {
      const links: NavLink[] = [
        { label: 'Features', to: { name: 'features' } },
        { label: 'Pricing', to: { name: 'pricing' } },
      ];
      const navLinks = mountComponent(links).findAllComponents(RouterLinkStub);
      navLinks.forEach((link, i) => expect(link.text()).toContain(links[i].label));
    });

    it('renders links with optional params and hash', () => {
      const links: NavLink[] = [
        { label: 'Simple', to: { name: 'home' } },
        { label: 'With hash', to: { name: 'docs', hash: '#section' } },
        { label: 'With params', to: { name: 'recipe', params: { id: '42' } } },
      ];
      const navLinks = mountComponent(links).findAllComponents(RouterLinkStub);
      expect(navLinks[0].props('to')).toEqual({ name: 'home' });
      expect(navLinks[1].props('to')).toEqual({ name: 'docs', hash: '#section' });
      expect(navLinks[2].props('to')).toEqual({ name: 'recipe', params: { id: '42' } });
    });
  });

  describe('navigationMenuTriggerStyle calls', () => {
    it('calls navigationMenuTriggerStyle once per link', () => {
      mountComponent([
        { label: 'Link 1', to: { name: 'link1' } },
        { label: 'Link 2', to: { name: 'link2' } },
      ]);
      expect(mockNavigationMenuTriggerStyle).toHaveBeenCalledTimes(2);
    });

    it('does not call navigationMenuTriggerStyle when the links array is empty', () => {
      mountComponent([]);
      expect(mockNavigationMenuTriggerStyle).not.toHaveBeenCalled();
    });
  });
});
