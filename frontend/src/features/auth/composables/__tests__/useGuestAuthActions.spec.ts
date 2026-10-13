import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGuestAuthActions } from '../useGuestAuthActions';
import { isAuthenticated } from '@/api/auth';
import { useRoute } from 'vue-router';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  isAuthenticated: { value: false },
}));

describe('useGuestAuthActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isAuthenticated as any).value = false;
  });

  it('shows login and signup on a regular route', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'home' } as any);

    const { showLogin, showSignup, isLogged } = useGuestAuthActions();

    expect(showLogin.value).toBe(true);
    expect(showSignup.value).toBe(true);
    expect(isLogged.value).toBe(false);
  });

  it('hides the login button on the login route', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'login' } as any);

    const { showLogin, showSignup } = useGuestAuthActions();

    expect(showLogin.value).toBe(false);
    expect(showSignup.value).toBe(true);
  });

  it('hides the signup button on the signup route', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'signup' } as any);

    const { showLogin, showSignup } = useGuestAuthActions();

    expect(showLogin.value).toBe(true);
    expect(showSignup.value).toBe(false);
  });

  it('reports isLogged as true when isAuthenticated is true', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'home' } as any);
    (isAuthenticated as any).value = true;

    const { isLogged } = useGuestAuthActions();

    expect(isLogged.value).toBe(true);
  });
});
