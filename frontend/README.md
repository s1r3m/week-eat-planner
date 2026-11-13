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
development server on `0.0.0.0:3000`. The root Compose configuration uses this
image and mounts `frontend/` at `/app`.

QA uses `qa/docker/frontend/Dockerfile` to build and run the production server:

1. A Python build stage exports OpenAPI from the backend code using test settings.
   It does not start the backend or connect to a database.
2. A Node/Bun build stage installs locked dependencies and runs `bun run build`.
   `NUXT_OPENAPI_SCHEMA` points Nuxt at the exported schema file during the build.
3. The runtime image contains only Nuxt's `.output` and starts
   `node .output/server/index.mjs` as the `node` user on port 3000. QA does not
   mount source files or override the production command.

QA sets `NUXT_PUBLIC_API_URL=/api` so browser requests use the same origin,
including the QA port. Nginx forwards `/api/` requests to the backend. Server
rendering uses the private `NUXT_API_URL=http://backend:8000` instead, avoiding
a dependency on nginx routing back into the frontend. Without `NUXT_API_URL`,
server requests fall back to the public URL for local development.

Nuxt's `/api/_nuxt_icon/` endpoint is routed to the frontend by a more specific
nginx location. Its path must be preserved rather than stripped like backend
API paths. Compiled assets and public files are served by Nuxt through nginx.

From the repository root:

```bash
make -C qa install
make -C qa start
```

Open `http://localhost:81`. `start` follows Docker logs locally; press Ctrl+C to
stop following them while leaving the containers running. Then run:

```bash
make -C qa test
make -C qa stop
```

To rebuild only the frontend after a source change:

```bash
docker compose -f qa/docker/docker-compose.yml up -d --build --wait frontend nginx
```
