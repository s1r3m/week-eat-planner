# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Unit tests

Use Node.js 24 and Bun 1.3.14. Bun installs dependencies; Vitest runs the tests
under Node. After `bun install` has prepared Nuxt's generated types:

```bash
bun run test                  # all unit and focused component tests
bun run test:watch            # watch mode
bun run test:coverage         # tests and enforced coverage thresholds
bun run test:typecheck        # application and test TypeScript checks
bun run test -- tests/composables/weeks/useCreateWeek.spec.ts
```

From the repository root, `make nuxt_test` runs the same coverage command used
by CI. Reports are written to `coverage/`, including HTML (`index.html`), LCOV,
and JSON. Coverage includes all `app/**/composables/**/*.ts` files, including
unimported files, and the extracted auth error helper. Every included file must
reach 100% statements, branches, functions, and lines.

Tests mirror the application domains under `tests/composables/`. Focused UI
regressions live in `tests/components/` and `tests/pages/`; API, plugin, and utility
tests run in Node, while composable and UI tests run in jsdom. Component rendering
itself is outside the composable coverage threshold.

`tests/helpers/composable.ts` mounts a real Vue component with a fresh Pinia and
Colada instance. Tests exercise actual query and mutation lifecycles, mocking the
HTTP boundary through `useNuxtApp().$api`. Nuxt auto-imports are provided by the
test setup; the `useState` adapter shares keyed refs within a test and is reset
between tests. This tests shared state without booting the full Nuxt application.
Each mounted harness is unmounted and its Pinia disposed after the test. Globals,
spies, and fake timers are restored as well. Use deferred promises for pending
requests and fake timers for toast expiry instead of real delays.

### Behavior covered

- Week dialogs close immediately after submission. Create submits a trimmed
  name, disables Submit for whitespace-only input or a pending mutation, and
  starts with an empty form on each opening.
- Optimistic rollback changes only the affected week, preserving unrelated cache
  updates. Refetch failures remain query errors, without changing a successful
  mutation into a failed write.
- The weeks page shows its loader only when data is undefined. A loaded empty
  array keeps the empty state visible during refetch, including after deleting
  the last week. Errors retain their existing precedence over cached data.
- Toast state is shared, while the mounted `GlobalToast` owns expiry timers
  through `useToastAutoDismiss`. SSR creates no timers; mounting starts the full
  duration for existing toasts, and unmounting clears outstanding timers.

### Existing logout requests

Logout behavior is unchanged. Its success hook clears the cached user and
invalidates the weeks list. Colada immediately refetches active queries, and the
sidebar still consumes the weeks query before navigation unmounts it. That GET
can receive 401 after logout has cleared authentication cookies. The API
interceptor then attempts `POST /auth/refresh`, which also receives 401 because
the refresh cookie is gone. Reading `user.value` alone does not trigger this
sequence; invalidating an active weeks query does.
