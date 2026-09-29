import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    setupFiles: ['./tests/setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          name: 'vue',
          environment: 'jsdom',
          include: ['tests/{composables,components,pages}/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['tests/{api,plugins,utils}/**/*.spec.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: [
        'app/**/composables/**/*.ts',
        'app/modules/auth/utils/formError.ts',
      ],
      reporter: ['text', 'html', 'lcov', 'json'],
      thresholds: {
        perFile: true,
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
