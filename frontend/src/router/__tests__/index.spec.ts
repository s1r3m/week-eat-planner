import { describe, it, expect, beforeEach, vi } from 'vitest';
import router, { _resetRouterState } from '../index';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { isAuthenticated, initAuth } from '@/api/auth';

vi.mock('@/api/auth', () => ({
  isAuthenticated: { value: false },
  initAuth: vi.fn(),
}));

vi.mock('@/features/week/store/weeks', () => ({
  useWeekStore: vi.fn(),
}));

describe('Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    (isAuthenticated as any).value = false;
    _resetRouterState();
  });

  it('should redirect to login when accessing a protected route and not authenticated', async () => {
    await router.push({ name: ROUTE_NAMES.RECIPES });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.LOGIN);
    expect(router.currentRoute.value.query.redirect).toBe(`/app/${ROUTE_NAMES.RECIPES}`);
  });

  it('should allow access to protected route when authenticated', async () => {
    (isAuthenticated as any).value = true;
    await router.push({ name: ROUTE_NAMES.RECIPES });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.RECIPES);
  });

  it('should allow access to guest routes when not authenticated', async () => {
    (isAuthenticated as any).value = false;
    await router.push({ name: ROUTE_NAMES.LOGIN });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.LOGIN);
  });

  it('should redirect authenticated users away from guest routes to weeks', async () => {
    (isAuthenticated as any).value = true;
    await router.push({ name: ROUTE_NAMES.SIGNUP });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.WEEKS);
  });

  it('should redirect to not found for unknown routes', async () => {
    await router.push('/non-existent-route');
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.NOT_FOUND);
  });

  it('should call initAuth on first navigation', async () => {
    await router.push({ name: ROUTE_NAMES.WEEKS });
    expect(initAuth).toHaveBeenCalledTimes(1);
  });

  it('should handle initAuth error in beforeEach', async () => {
    const error = new Error('Auth fail');
    vi.mocked(initAuth).mockRejectedValueOnce(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await router.push({ name: ROUTE_NAMES.HOME });

    expect(initAuth).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Auth initialization failed:', error);
    expect(isAuthenticated.value).toBe(false);
    consoleSpy.mockRestore();
  });

  it('should visit all guest routes to cover dynamic imports', async () => {
    (isAuthenticated as any).value = false;
    const guestRoutes = [ROUTE_NAMES.SIGNUP, ROUTE_NAMES.FORGOT_PASSWORD];
    for (const name of guestRoutes) {
      await router.push({ name });
      expect(router.currentRoute.value.name).toBe(name);
    }
  });

  it('should visit all auth routes to cover dynamic imports', async () => {
    (isAuthenticated as any).value = true;
    const routeNames = [
      ROUTE_NAMES.WEEKS,
      ROUTE_NAMES.WEEK,
      ROUTE_NAMES.PROFILE,
      ROUTE_NAMES.RECIPES,
      ROUTE_NAMES.RECIPES_CREATE,
      ROUTE_NAMES.RECIPES_MY,
      ROUTE_NAMES.RECIPES_FAVORITES,
      ROUTE_NAMES.RECIPE,
      ROUTE_NAMES.NOT_FOUND,
    ];

    for (const name of routeNames) {
      const params = name === ROUTE_NAMES.WEEK || name === ROUTE_NAMES.RECIPE ? { id: '1' } : {};
      await router.push({ name, params });
      expect(router.currentRoute.value.name).toBe(name);
    }
  });
});
