import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { useAuthStore } from '@/features/auth/store/auth';
import { useGuestAuthActions } from '@/features/auth/composables/useGuestAuthActions';

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRoute: vi.fn(),
    useRouter: vi.fn(),
  };
});

import { useRoute, useRouter } from 'vue-router';

describe('useGuestAuthActions', () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ stubActions: false }));
  });

  const setup = (isAuthenticated: boolean, name: string) => {
    const authStore = useAuthStore();
    authStore.accessToken = isAuthenticated ? 'token' : null;
    authStore.logout = vi.fn();
    (useRoute as Mock).mockReturnValue({ name });
    (useRouter as Mock).mockReturnValue({ go: vi.fn() });

    return {
      ...useGuestAuthActions(),
      authStore,
    };
  };

  it('shows Login when not authenticated and not on /login', () => {
    const { showLogin } = setup(false, 'promo');

    expect(showLogin.value).toBe(true);
  });

  it('hides Login on /login route', () => {
    const { showLogin } = setup(false, 'login');

    expect(showLogin.value).toBe(false);
  });

  it('shows Sign Up when not authenticated and not on /signup', () => {
    const { showSignup } = setup(false, 'promo');

    expect(showSignup.value).toBe(true);
  });

  it('hides Sign Up on /signup route', () => {
    const { showSignup } = setup(false, 'signup');

    expect(showSignup.value).toBe(false);
  });

  it('shows neither Login nor Sign Up when authenticated', () => {
    const { showLogin, showSignup } = setup(true, 'promo');

    expect(showLogin.value).toBe(false);
    expect(showSignup.value).toBe(false);
  });

  it('calls logout', () => {
    const { logoutHandler, authStore } = setup(true, 'promo');

    logoutHandler();
    expect(authStore.logout).toHaveBeenCalled();
    expect(useRouter().go).toHaveBeenCalled();
  });
});
