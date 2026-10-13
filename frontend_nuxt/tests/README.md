# Frontend tests

Run from `frontend_nuxt`:

- `bun run test` runs all unit, component, and page tests.
- `bun run test:coverage` enforces 100% statements, branches, functions, and lines per file for every runtime TypeScript module and Vue component under `app/`. Type-only modules are excluded. The report includes scripts and template render branches.
- `bun run test:typecheck` checks application and test types against Nuxt's generated declarations.
- `bun run lint` checks application code and tests.

The test setup supplies Nuxt's auto-imported Vue and Pinia Colada functions. Query and mutation factories must be available at module import time, before test hooks run. Each test gets fresh Nuxt `useState` storage.

Use `mountComposable` for Vue component tests with a real Pinia Colada cache. Use `withAppContext` for Node tests that need Pinia and application injection without a DOM. Both helpers dispose their scopes and stores after each test. Mock the API transport and control deferred responses to verify loading, optimistic updates, failures, and concurrent cache changes.

Test the current exports in `authApi.ts` and `weeksApi.ts`, rather than the removed query and mutation composables. Use objects as table rows when an argument is itself an array, so Vitest does not spread the array into separate arguments.

`weeksHydration.spec.ts` starts the shared weeks query outside the page's component scope, renders the page with Vue's server renderer, serializes and restores the real query cache, and hydrates the resulting HTML. It covers both an empty list and a populated list, asserting that no hydration warning is emitted and no duplicate weeks request is sent.
