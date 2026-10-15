# Week Eat Planner frontend

The frontend uses Nuxt 4 and Vue 3. Use Node.js 24 and Bun 1.3.14.

## Setup and development

From the repository root:

```bash
make fe_install
make fe_start
```

`fe_install` installs dependencies from `bun.lock` and prepares Nuxt. It copies
`.env.fe_test` to `.env` only when `.env` is absent. Keep the backend running on
port 8000: Nuxt uses its live OpenAPI schema for generated API types. The frontend
runs at `http://localhost:3000`.

Application code lives in `app/`, public assets in `public/`, and tests in
`tests/`. Nuxt generates `.nuxt/`; do not commit generated files.

## Checks and formatting

From the repository root:

```bash
make fe_lint   # Oxlint, ESLint, Stylelint, Prettier, and TypeScript checks
make fe_style  # formatting and automatic lint fixes
make fe_test   # tests with coverage thresholds
```

Lint commands only check files. Use `fe_style` to apply automatic fixes.

## Unit tests

Bun installs dependencies; Vitest runs the tests under Node. From `frontend/`:

```bash
bun run test
bun run test:watch
bun run test:coverage
bun run test:typecheck
bun run test -- tests/composables/weeks/useCreateWeek.spec.ts
```

Coverage requires 100% statements, branches, functions, and lines per file for
runtime TypeScript modules and Vue components under `app/`. Type-only modules
are excluded. Reports are written to `coverage/`, including HTML, LCOV, and JSON.
The TypeScript check requires Nuxt's generated API declarations and runs as part
of `fe_lint`, including in CI. Coverage remains a separate check under `fe_test`.

Composable and UI tests run in jsdom; API, plugin, and utility tests run in Node.
The helpers mount real Vue, Pinia, and Colada instances while mocking the HTTP
boundary and Nuxt globals.

## Production

From `frontend/`:

```bash
bun run build
bun run preview
```

## Docker

The frontend Dockerfile uses Node.js 24 and Bun 1.3.14 and starts Nuxt's
development server on `0.0.0.0:3000`. Both the root Compose configuration and
the QA Compose configuration use this image and mount `frontend/` at `/app`.
