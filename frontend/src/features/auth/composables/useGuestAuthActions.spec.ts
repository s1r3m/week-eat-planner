import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { useAuthStore } from '@/features/auth/store/auth';
import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';
import { useRoute } from 'vue-router';

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRoute: vi.fn(),
  };
});

describe('useGuestAuthActions', () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ stubActions: false }));
  });

  const setup = (isAuthenticated: boolean, name: string) => {
    const authStore = useAuthStore();
    authStore.accessToken = isAuthenticated ? 'token' : null;
    authStore.logout = vi.fn();
    (useRoute as Mock).mockReturnValue({ name });

    return {
      ...useGuestAuthActions(),
      authStore,
    };
  };

  it('shows Login when not on /login', () => {
    const { showLogin } = setup(false, 'promo');

    expect(showLogin.value).toBe(true);
  });

  it('hides Login on /login route', () => {
    const { showLogin } = setup(false, 'login');

    expect(showLogin.value).toBe(false);
  });

  it('shows Sign Up when not on /signup', () => {
    const { showSignup } = setup(false, 'promo');

    expect(showSignup.value).toBe(true);
  });

  it('hides Sign Up on /signup route', () => {
    const { showSignup } = setup(false, 'signup');

    expect(showSignup.value).toBe(false);
  });

  it.each([true, false])('shows isLogged when needed -- has token %0', (hasToken) => {
    const { isLogged } = setup(hasToken, 'promo');

    expect(isLogged.value).toBe(hasToken);
  });

  it('calls logout', () => {
    const { logoutHandler, authStore } = setup(true, 'promo');

    logoutHandler();
    expect(authStore.logout).toHaveBeenCalled();
  });
});
