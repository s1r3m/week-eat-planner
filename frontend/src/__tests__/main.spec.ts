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
    const { PiniaColada } = await import('@pinia/colada');
    const i18n = (await import('@/i18n')).default;
    const router = (await import('@/router')).default;

    await import('../main');

    const app = vi.mocked(createApp).mock.results[0].value;

    expect(createApp).toHaveBeenCalled();
    expect(createPinia).toHaveBeenCalled();
    const pinia = vi.mocked(createPinia).mock.results[0].value;
    expect(app.use).toHaveBeenCalledWith(pinia);
    expect(app.use).toHaveBeenCalledWith(PiniaColada);
    expect(app.use).toHaveBeenCalledWith(router);
    expect(app.use).toHaveBeenCalledWith(i18n);
    expect(app.mount).toHaveBeenCalledWith('#app');
  });
});
