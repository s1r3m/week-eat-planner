import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGuestAuthActions } from '../useGuestAuthActions';
import { accessToken } from '@/api/auth';
import { useRoute } from 'vue-router';
import { ref } from 'vue';

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

  it('computes properties correctly for normal routes', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'home' } as any);

    const { showLogin, showSignup, isLogged } = useGuestAuthActions();

    expect(showLogin.value).toBe(true);
    expect(showSignup.value).toBe(true);
    expect(isLogged.value).toBe(false);
  });

  it('computes properties correctly for login route', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'login' } as any);

    const { showLogin, showSignup, isLogged } = useGuestAuthActions();

    expect(showLogin.value).toBe(false);
    expect(showSignup.value).toBe(true);
    expect(isLogged.value).toBe(false);
  });

  it('computes properties correctly for signup route', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'signup' } as any);

    const { showLogin, showSignup, isLogged } = useGuestAuthActions();

    expect(showLogin.value).toBe(true);
    expect(showSignup.value).toBe(false);
    expect(isLogged.value).toBe(false);
  });

  it('isLogged is true when accessToken exists', () => {
    vi.mocked(useRoute).mockReturnValue({ name: 'home' } as any);
    (accessToken as any).value = 'token';

    const { isLogged } = useGuestAuthActions();

    expect(isLogged.value).toBe(true);
  });
});
