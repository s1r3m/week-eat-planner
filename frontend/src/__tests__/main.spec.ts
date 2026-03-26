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

describe('main.ts', () => {
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
});
