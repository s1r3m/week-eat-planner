import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGuestAuthActions } from '../useGuestAuthActions';
import { accessToken } from '@/api/auth';
import { useRoute } from 'vue-router';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  accessToken: { value: null },
}));

describe('useGuestAuthActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (accessToken as any).value = null;
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

  it('reports isLogged as true when accessToken is present', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'home' } as any);
    (accessToken as any).value = 'token';

    const { isLogged } = useGuestAuthActions();

    expect(isLogged.value).toBe(true);
  });
});
