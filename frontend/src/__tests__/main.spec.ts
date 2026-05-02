import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

vi.mock('vue', () => ({
  createApp: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    mount: vi.fn(),
  })),
  defineComponent: vi.fn((config) => config),
}));

vi.mock('pinia', () => ({
  createPinia: vi.fn(() => ({
    use: vi.fn(),
  })),
}));

vi.mock('pinia-plugin-persistedstate', () => ({
  default: vi.fn(),
}));

vi.mock('@/router', () => ({
  default: { install: vi.fn() },
}));

vi.mock('@pinia/colada', () => ({
  PiniaColada: { install: vi.fn() },
  PiniaColadaQueryHooksPlugin: vi.fn(() => 'mock-plugin'),
}));

vi.mock('@/i18n', () => ({
  default: { install: vi.fn() },
}));

// Mock the CSS import to avoid errors in test environment
vi.mock('@/assets/style.css', () => ({}));
vi.mock('vue-sonner/style.css', () => ({}));

vi.mock('@/App.vue', () => ({
  default: { name: 'App' },
}));

vi.mock('@/components/ui/sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    isAxiosError: vi.fn(
      (err: unknown) =>
        typeof err === 'object' &&
        err !== null &&
        (err as { isAxiosError?: unknown }).isAxiosError === true,
    ),
  },
}));

describe('main.ts', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('bootstraps the Vue app with all plugins and mounts to #app', async () => {
    const { createApp } = await import('vue');
    const { createPinia } = await import('pinia');
    const { PiniaColada, PiniaColadaQueryHooksPlugin } = await import('@pinia/colada');
    const i18n = (await import('@/i18n')).default;
    const router = (await import('@/router')).default;

    await import('../main');

    const app = vi.mocked(createApp).mock.results[0].value;
    const { handleGlobalError } = await import('../main');

    expect(createApp).toHaveBeenCalled();
    expect(createPinia).toHaveBeenCalled();
    const pinia = vi.mocked(createPinia).mock.results[0].value;
    expect(app.use).toHaveBeenCalledWith(pinia);
    expect(PiniaColadaQueryHooksPlugin).toHaveBeenCalledWith({ onError: handleGlobalError });
    expect(app.use).toHaveBeenCalledWith(
      PiniaColada,
      expect.objectContaining({
        plugins: ['mock-plugin'],
        mutationOptions: { onError: handleGlobalError },
      }),
    );
    expect(app.use).toHaveBeenCalledWith(router);
    expect(app.use).toHaveBeenCalledWith(i18n);
    expect(app.mount).toHaveBeenCalledWith('#app');
  });

  describe('handleGlobalError', () => {
    it('shows the error message for a plain Error', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');
      const error = new Error('Regular error');

      handleGlobalError(error);

      expect(toast.error).toHaveBeenCalledWith('Regular error');
    });

    it('shows a generic message for an unknown non-Error value', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');

      handleGlobalError('something went wrong');

      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });

    it('silently ignores errors from the refresh endpoint', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');
      const axiosError = {
        isAxiosError: true,
        config: { url: '/api/auth/refresh' },
      };

      handleGlobalError(axiosError);

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('shows response detail when the axios error has one', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');
      const axiosError = {
        isAxiosError: true,
        response: { data: { detail: 'Specific API error' } },
      };

      handleGlobalError(axiosError);

      expect(toast.error).toHaveBeenCalledWith('Specific API error');
    });

    it('shows the error message when axios error has no detail', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');
      const axiosError = {
        isAxiosError: true,
        message: 'Axios connection error',
        response: { data: {} },
      };

      handleGlobalError(axiosError);

      expect(toast.error).toHaveBeenCalledWith('Axios connection error');
    });

    it('shows a generic message when axios error has neither detail nor message', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');
      const axiosError = {
        isAxiosError: true,
        response: { data: {} },
      };

      handleGlobalError(axiosError);

      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });
  });
});
