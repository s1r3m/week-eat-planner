import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import router from './index';
import { useAuthStore } from '@/features/auth/store/auth';
import { useWeekStore } from '@/features/week/store/weeks';

// Mock the stores
vi.mock('@/features/auth/store/auth', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/features/week/store/weeks', () => ({
  useWeekStore: vi.fn(),
}));

// Mock layouts and pages to avoid importing components
vi.mock('@/layouts/TheGuestLayout.vue', () => ({
  default: { name: 'TheGuestLayout', template: '<div/>' },
}));
vi.mock('@/layouts/TheAuthLayout.vue', () => ({
  default: { name: 'TheAuthLayout', template: '<div/>' },
}));
vi.mock('@/pages/HomePage.vue', () => ({ default: { name: 'HomePage', template: '<div/>' } }));

describe('Router', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should redirect to login when accessing a protected route and not authenticated', async () => {
    const authStore = { accessToken: null };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push('/recipes');
    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/recipes');
  });

  it('should allow access to protected route when authenticated', async () => {
    const authStore = { accessToken: 'valid-token' };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push('/recipes');
    expect(router.currentRoute.value.name).toBe('recipes');
  });

  it('should allow access to guest routes when not authenticated', async () => {
    const authStore = { accessToken: null };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push('/login');
    expect(router.currentRoute.value.name).toBe('login');
  });

  it('should redirect to promo for unknown routes', async () => {
    const authStore = { accessToken: null };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push('/non-existent-route');
    expect(router.currentRoute.value.name).toBe('promo');
  });

  it('should load async components', async () => {
    const authStore = { accessToken: 'token' };
    (useAuthStore as any).mockReturnValue(authStore);

    // Trigger dynamic imports
    await router.push('/login');
    await router.push('/signup');
    await router.push('/weeks');
    await router.push('/profile');

    expect(router.currentRoute.value.name).toBe('profile');
  });

  describe('Breadcrumbs meta', () => {
    it('should return correct breadcrumbs for static meta', async () => {
      const authStore = { accessToken: 'token' };
      (useAuthStore as any).mockReturnValue(authStore);

      await router.push('/recipes');
      const breadcrumbs = router.currentRoute.value.meta.breadcrumbs;
      expect(breadcrumbs).toEqual([{ label: 'All recipes' }]);
    });

    it('should return dynamic breadcrumbs for week single page', async () => {
      const authStore = { accessToken: 'token' };
      (useAuthStore as any).mockReturnValue(authStore);

      const weekStore = { getWeekNameById: vi.fn().mockReturnValue('Week 1') };
      (useWeekStore as any).mockReturnValue(weekStore);

      await router.push('/weeks/123');

      const breadcrumbsFn = router.currentRoute.value.meta.breadcrumbs as Function;
      expect(typeof breadcrumbsFn).toBe('function');

      const breadcrumbs = breadcrumbsFn(router.currentRoute.value);
      expect(weekStore.getWeekNameById).toHaveBeenCalledWith('123');
      expect(breadcrumbs).toEqual([{ to: '/weeks', label: 'My weeks' }, { label: 'Week 1' }]);
    });
  });

  describe('scrollBehavior', () => {
    it('should return savedPosition if provided', async () => {
      const scrollBehavior = router.options.scrollBehavior;
      if (typeof scrollBehavior !== 'function') throw new Error('scrollBehavior is not a function');

      const result = await scrollBehavior({} as any, {} as any, { left: 10, top: 20 });
      expect(result).toEqual({ left: 10, top: 20 });
    });

    it('should return { left: 0, top: 0 } by default', async () => {
      const scrollBehavior = router.options.scrollBehavior;
      if (typeof scrollBehavior !== 'function') throw new Error('scrollBehavior is not a function');

      const result = await scrollBehavior({} as any, {} as any, null);
      expect(result).toEqual({ left: 0, top: 0 });
    });

    it('should scroll to hash with offset if hash is present', async () => {
      // Mocking window and document.querySelector for scrollToHashWithOffset
      const mockTarget = {
        getBoundingClientRect: () => ({ top: 100 }),
      };
      const mockHeader = {
        getBoundingClientRect: () => ({ height: 50 }),
      };

      vi.stubGlobal('document', {
        querySelector: vi.fn((selector) => {
          if (selector === '#target') return mockTarget;
          if (selector === 'header.sticky') return mockHeader;
          return null;
        }),
      });
      vi.stubGlobal('window', {
        scrollY: 0,
      });
      vi.stubGlobal('requestAnimationFrame', (cb: any) => cb(0));

      const scrollBehavior = router.options.scrollBehavior;
      if (typeof scrollBehavior !== 'function') throw new Error('scrollBehavior is not a function');

      const result = await scrollBehavior({ hash: '#target' } as any, {} as any, null);

      // top = window.scrollY (0) + target.top (100) - headerHeight (50) - 16 = 34
      expect(result).toEqual({
        left: 0,
        top: 34,
        behavior: 'smooth',
      });

      vi.unstubAllGlobals();
    });

    it('should scroll to hash with offset if header is not present', async () => {
      const mockTarget = {
        getBoundingClientRect: () => ({ top: 100 }),
      };

      vi.stubGlobal('document', {
        querySelector: vi.fn((selector) => {
          if (selector === '#target') return mockTarget;
          return null;
        }),
      });
      vi.stubGlobal('window', {
        scrollY: 0,
      });
      vi.stubGlobal('requestAnimationFrame', (cb: any) => cb(0));

      const scrollBehavior = router.options.scrollBehavior;
      if (typeof scrollBehavior !== 'function') throw new Error('scrollBehavior is not a function');

      const result = await scrollBehavior({ hash: '#target' } as any, {} as any, null);

      // top = window.scrollY (0) + target.top (100) - 0 (no header) - 16 = 84
      expect(result).toEqual({
        left: 0,
        top: 84,
        behavior: 'smooth',
      });

      vi.unstubAllGlobals();
    });

    it('should handle undefined window in scrollToHashWithOffset', async () => {
      const originalWindow = globalThis.window;
      // @ts-ignore
      delete (globalThis as any).window;

      const scrollBehavior = router.options.scrollBehavior;
      if (typeof scrollBehavior !== 'function') throw new Error('scrollBehavior is not a function');

      const result = await scrollBehavior({ hash: '#target' } as any, {} as any, null);

      expect(result).toEqual({ left: 0, top: 0 });

      globalThis.window = originalWindow;
    });

    it('should return { left: 0, top: 0 } if hash target not found', async () => {
      vi.stubGlobal('document', {
        querySelector: vi.fn().mockReturnValue(null),
      });
      vi.stubGlobal('requestAnimationFrame', (cb: any) => cb(0));

      const scrollBehavior = router.options.scrollBehavior;
      if (typeof scrollBehavior !== 'function') throw new Error('scrollBehavior is not a function');

      const result = await scrollBehavior({ hash: '#non-existent' } as any, {} as any, null);

      expect(result).toEqual({ left: 0, top: 0 });

      vi.unstubAllGlobals();
    });
  });
});
