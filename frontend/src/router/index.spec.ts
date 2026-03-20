import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import router from './index';
import { useAuthStore } from '@/features/auth/store/auth';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

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
    const authStore = { accessToken: null, init: vi.fn() };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push({ name: ROUTE_NAMES.RECIPES });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.LOGIN);
    expect(router.currentRoute.value.query.redirect).toBe(`/app/${ROUTE_NAMES.RECIPES}`);
  });

  it('should wait for auth init before checking authentication', async () => {
    const authStore = {
      accessToken: null,
      init: vi.fn().mockImplementation(async function (this: any) {
        this.accessToken = 'refreshed-token';
      }),
    };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push({ name: ROUTE_NAMES.RECIPES });

    expect(authStore.init).toHaveBeenCalled();
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.RECIPES);
  });

  it('should allow access to protected route when authenticated', async () => {
    const authStore = { accessToken: 'valid-token', init: vi.fn() };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push({ name: ROUTE_NAMES.RECIPES });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.RECIPES);
  });

  it('should allow access to guest routes when not authenticated', async () => {
    const authStore = { accessToken: null, init: vi.fn() };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push({ name: ROUTE_NAMES.LOGIN });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.LOGIN);
  });

  it('should redirect to promo for unknown routes', async () => {
    const authStore = { accessToken: null, init: vi.fn() };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push('/non-existent-route');
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.NOT_FOUND);
  });

  it('should load async components', async () => {
    const authStore = { accessToken: 'token', init: vi.fn() };
    (useAuthStore as any).mockReturnValue(authStore);

    const routesToTest = [
      { name: ROUTE_NAMES.LOGIN },
      { name: ROUTE_NAMES.SIGNUP },
      { name: ROUTE_NAMES.FORGOT_PASSWORD },
      { name: ROUTE_NAMES.WEEKS },
      { name: ROUTE_NAMES.WEEK, params: { id: '1' } },
      { name: ROUTE_NAMES.PROFILE },
      { name: ROUTE_NAMES.RECIPES },
      { name: ROUTE_NAMES.RECIPE, params: { id: '1' } },
      { name: ROUTE_NAMES.RECIPES_CREATE },
      { name: ROUTE_NAMES.RECIPES_MY },
      { name: ROUTE_NAMES.RECIPES_FAVORITES },
      { name: ROUTE_NAMES.NOT_FOUND, params: { pathMatch: ['not', 'found'] } },
    ];

    for (const route of routesToTest) {
      await router.push(route);
      expect(router.currentRoute.value.name).toBe(route.name);
    }
  });

  it('should not call init if already initialized', async () => {
    const authStore = { accessToken: 'token', init: vi.fn(), isInitialized: true };
    (useAuthStore as any).mockReturnValue(authStore);

    await router.push({ name: ROUTE_NAMES.RECIPES });
    expect(authStore.init).not.toHaveBeenCalled();
  });
});
