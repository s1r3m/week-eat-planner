/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import { CoverageV8Options } from 'vitest/node';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/components/ui'],
      thresholds: {
        statements: 100,
        branches: 95, // TODO: make it 100!
        functions: 100,
        lines: 100,
      },
    },
  },
  server: {
    host: '0.0.0.0', // Allow access from outside the container
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Strip /api prefix before forwarding
      },
    },
  },
} as UserConfig & { test: CoverageV8Options });
