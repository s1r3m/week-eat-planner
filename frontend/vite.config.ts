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
      provider: 'v8',
      include: ['src/**/*.{ts,tsx,vue}'],
      exclude: ['src/components/ui', '**/header/types/**', 'src/App.vue', 'src/**/index.ts'],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 88,
        lines: 90,
      },
    },
  },
  server: {
    host: '0.0.0.0', // Allow access from outside the container
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
} as UserConfig & { test: CoverageV8Options });
