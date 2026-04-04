# Project Guidelines

## Code Style

- **Backend**: Python 3.11. Uses `ruff` for linting and formatting (line length 120) and `mypy` for static type checking.
- **Frontend**: Vue 3 with TypeScript, using the Composition API (`<script setup>`). Uses `eslint` and `prettier` for linting and formatting.

## Architecture

- **Backend**: FastAPI web framework, `sqlalchemy[asyncio]` (v2.0) with `asyncpg` for PostgreSQL database access, `alembic` for database migrations, and `pydantic` (v2) for schemas.
- **Frontend**: Vite-powered Vue 3 app, `pinia` (with `pinia-plugin-persistedstate`) for state management, `vue-router` for routing, and Tailwind CSS v4 for styling. Uses `reka-ui` and `lucide-vue-next`.
- **Project Structure**: Monorepo with `backend/` (FastAPI), `frontend/` (Vue.js), and `qa/` (testing infrastructure). `docker-compose.yml` provides DB and services.

## Build and Test

The project heavily relies on the `Makefile` at the root for common tasks.

- **Install**: Run `make install` (uses `uv` for Python) and `make fe_install` (uses `yarn`).
- **Start**: Run `make start` to run backend (starts DB via docker implicitly), and `make fe_start` for frontend.
- **Lint & Format**: Run `make lint` / `make style` for backend, and `make fe_lint` / `make fe_style` for frontend.
- **Tests**:
  - Backend: `make be_test` (runs `pytest` with coverage).
  - Frontend: `make fe_test` (runs `vitest`).

## Conventions

- Always run commands via the `Makefile` when possible.
- **Frontend State Management**: Use an `isLoaded` flag in Pinia stores to prevent redundant fetches rather than relying on truthy checks on arrays. E.g., prefer `await store.fetchWeeks()` where `fetchWeeks` handles its own loading state check.
- **Documentation**: See `README.md`, `CONTRIBUTING.md`, and `frontend/README.md` for more onboarding context. Link to these files instead of duplicating their contents.
