# Project Guidelines

## Code Style

- **Backend**: Python 3.11. Uses `ruff` for linting and formatting (line length 120) and `mypy` for static type checking.
- **Frontend**: Vue 3 with TypeScript, using the Composition API (`<script setup>`). Uses `eslint` and `prettier` for linting and formatting.

## Commands

All common tasks are run via `make` from the project root.

### Backend

```bash
make install          # Install Python deps (uses uv into .venv_python3.11)
make start            # Start backend at :8000 (stops containers, runs migrations, starts MinIO)
make be_lint          # ruff check + ruff format --diff + mypy
make be_style         # ruff check --fix + ruff format (auto-fix)
make be_test          # pytest with 100% coverage requirement
make migrations       # Apply alembic migrations
make run_db           # Start PostgreSQL via docker-compose
make stop             # docker-compose down --volumes --remove-orphans
```

### Frontend

```bash
make fe_install       # yarn install
make fe_start         # Vite dev server at :3000
make fe_lint          # eslint + prettier check
make fe_style         # prettier format + eslint --fix
make fe_test          # vitest with coverage
```

### Running a single test

```bash
# Backend — pass pytest args via the shell
cd backend && coverage run -m pytest tests/path/to/test_file.py::TestClass::test_method -v

# Frontend
cd frontend && yarn vitest run src/path/to/component.spec.ts
```

## Architecture

**Monorepo**: `backend/` (FastAPI), `frontend/` (Vue 3), `qa/` (integration tests), `docker-compose.yml` (PostgreSQL + MinIO).

### Backend (`backend/week_eat_planner/`)

- **FastAPI** app with modular routers in `api/` (auth, recipe, user, week, monitoring)
- **SQLAlchemy 2.0 async** (asyncpg) with models in `db/models/`; sessions via `db/session_maker.py`
- **Alembic** migrations in `alembic/`
- **Pydantic v2** schemas in `api/schemas/` per domain
- **Auth**: JWT + HTTP-only cookie refresh tokens; `security/token_provider.py`; injected via `get_current_active_user()` dependency
- **MinIO** (S3-compatible) for image storage via boto3
- Backend tests in `tests/`, structured to mirror `api/`; 100% coverage enforced

### Frontend (`frontend/src/`)

- **Vue 3** with `<script setup>` (Composition API), **TypeScript strict**
- **@pinia/colada** for all server state: queries via `defineQueryOptions()` + `useQuery()`, mutations via `defineMutation()` + `useMutation()` with optimistic updates and cache invalidation
- Cache key convention: hierarchical arrays, e.g. `['weeks', 'list']`, `['weeks', 'detail', id]` — see `api/weeks.ts` for the canonical pattern
- **Feature-based structure**: `features/<domain>/components/` + `features/<domain>/composables/`; pages in `pages/`; shared UI in `components/`
- **Axios** client at `api/client.ts` wraps all HTTP calls
- **Tailwind CSS v4** + `reka-ui` component primitives + `lucide-vue-next` icons
- **vue-i18n** for internationalization
- Tests colocated in `__tests__/` directories alongside source files; run with Vitest + Vue Test Utils

## Conventions

- Always run commands via the `Makefile` when possible.
- **Frontend State Management**: Use an `isLoaded` flag in Pinia stores to prevent redundant fetches rather than relying on truthy checks on arrays. E.g., prefer `await store.fetchWeeks()` where `fetchWeeks` handles its own loading state check.
- **Documentation**: See `README.md`, `CONTRIBUTING.md`, and `frontend/README.md` for more onboarding context. Link to these files instead of duplicating their contents.
