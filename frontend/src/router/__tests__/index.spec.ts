import { describe, it, expect, beforeEach, vi } from 'vitest';
import router from '../index';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { accessToken, initAuth } from '@/api/auth';

vi.mock('@/api/auth', () => ({
  accessToken: { value: null },
  initAuth: vi.fn(),
}));

vi.mock('@/features/week/store/weeks', () => ({
  useWeekStore: vi.fn(),
}));

describe('Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accessToken as any).value = null;
  });

  it('should redirect to login when accessing a protected route and not authenticated', async () => {
    await router.push({ name: ROUTE_NAMES.RECIPES });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.LOGIN);
    expect(router.currentRoute.value.query.redirect).toBe(`/app/${ROUTE_NAMES.RECIPES}`);
  });

  it('should allow access to protected route when authenticated', async () => {
    (accessToken as any).value = 'valid-token';
    await router.push({ name: ROUTE_NAMES.RECIPES });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.RECIPES);
  });

  it('should allow access to guest routes when not authenticated', async () => {
    (accessToken as any).value = null;
    await router.push({ name: ROUTE_NAMES.LOGIN });
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.LOGIN);
  });

  it('should redirect to not found for unknown routes', async () => {
    await router.push('/non-existent-route');
    expect(router.currentRoute.value.name).toBe(ROUTE_NAMES.NOT_FOUND);
  });
});
