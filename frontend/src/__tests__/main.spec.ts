import { describe, it, expect, vi } from 'vitest';

// Mock all dependencies before importing main
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

// Mock the CSS import to avoid errors in test environment
vi.mock('@/assets/style.css', () => ({}));

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
    isAxiosError: vi.fn((err) => err && err.isAxiosError),
  },
}));

describe('main.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes the application correctly', async () => {
    const { createApp } = await import('vue');
    const { createPinia } = await import('pinia');
    const router = (await import('@/router')).default;

    // Import the main module which should call createApp
    await import('../main');

    expect(createApp).toHaveBeenCalled();
    expect(createPinia).toHaveBeenCalled();
    expect(router).toBeDefined();
  });

  describe('handleGlobalError', () => {
    it('handles non-axios error', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');
      const error = new Error('Regular error');

      handleGlobalError(error);

      expect(toast.error).toHaveBeenCalledWith('Regular error');
    });

    it('handles non-axios unknown error', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');

      handleGlobalError('something went wrong');

      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });

    it('ignores silent refresh failures', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');
      const axiosError = {
        isAxiosError: true,
        config: { url: '/api/auth/refresh' },
      };

      handleGlobalError(axiosError);

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('handles axios error with detail', async () => {
      const { handleGlobalError } = await import('../main');
      const { toast } = await import('@/components/ui/sonner');
      const axiosError = {
        isAxiosError: true,
        response: { data: { detail: 'Specific API error' } },
      };

      handleGlobalError(axiosError);

      expect(toast.error).toHaveBeenCalledWith('Specific API error');
    });

    it('handles axios error with message', async () => {
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

    it('handles axios error without message or detail', async () => {
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
