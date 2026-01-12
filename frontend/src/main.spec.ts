import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/router/index';
import { useAuthStore } from './features/auth/store/auth';

// Mock all dependencies
vi.mock('vue', () => ({
  createApp: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    mount: vi.fn(),
  })),
}));

vi.mock('pinia', () => ({
  createPinia: vi.fn(() => ({
    use: vi.fn(),
  })),
}));

vi.mock('pinia-plugin-persistedstate', () => ({
  default: vi.fn(),
}));

vi.mock('@/router/index', () => ({
  default: {},
}));

const mockInit = vi.fn().mockResolvedValue(undefined);
vi.mock('./features/auth/store/auth', () => ({
  useAuthStore: vi.fn(() => ({
    init: mockInit,
  })),
}));

// Mock the CSS import to avoid errors in test environment
vi.mock('@/assets/style.css', () => ({}));

describe('main.ts', () => {
  it('initializes the application correctly', async () => {
    // We import main.ts which triggers startApp()
    await import('./main');

    await vi.waitFor(() => {
      expect(mockInit).toHaveBeenCalled();
    });
    expect(createApp).toHaveBeenCalled();
    expect(createPinia).toHaveBeenCalled();
    expect(useAuthStore).toHaveBeenCalled();
    expect(router).toBeDefined();
  });
});
