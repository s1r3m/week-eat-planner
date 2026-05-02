# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Week Eat Planner is a weekly meal planning app. Users create weekly meal plans, assign recipes to meal slots, and generate shopping lists. The backend is FastAPI + PostgreSQL; the frontend is Vue 3 + TypeScript.

## Commands

All common tasks are in the `Makefile`. Run `make help` for a full list.

### Backend

```bash
make install          # install Python deps via uv into .venv_python3.11
make start            # stop containers, run migrations, start uvicorn on :8000
make be_lint          # ruff check + ruff format --diff + mypy
make be_style         # ruff check --fix + ruff format (auto-fixes)
make be_test          # pytest with 100% coverage requirement
make migrations       # run alembic upgrade head (requires DB to be up)
```

Run a single test file or test:
```bash
cd backend && python -m pytest tests/services/test_auth_service.py -vv
cd backend && python -m pytest tests/api/test_auth.py::test_login -vv
```

### Frontend

```bash
make fe_install       # yarn install
make fe_start         # vite dev server on :3000
make fe_lint          # eslint + prettier check
make fe_style         # prettier write + eslint --fix
make fe_test          # vitest run --coverage
```

### Infrastructure

```bash
make run_db           # start postgres only (docker compose)
make stop             # docker compose down --volumes --remove-orphans
make db_shell         # pgcli into local DB
```

## Architecture

### Backend (`backend/week_eat_planner/`)

Layered: **Router → Service → DAO → SQLAlchemy model**

- `api/` — FastAPI routers (`auth.py`, `recipe.py`, `week.py`, `user.py`). Each router has a corresponding `api/schemas/` file with Pydantic request/response models.
- `api/dependencies/` — FastAPI dependencies: `auth_deps.py` (JWT + cookie auth), `storage_deps.py` (MinIO), `httpx_client_deps.py`.
- `services/` — Business logic. Services receive an `AsyncSession` and instantiate DAOs directly. No dependency injection container.
- `db/base.py` — `Base` (SQLAlchemy `DeclarativeBase`) and `BaseDAO[T]` (generic async CRUD: `add`, `find_one_or_none`, `find_all`, `update`, `delete`). All DAOs extend `BaseDAO`.
- `db/dao.py` — Concrete DAOs: `UserDAO`, `RecipeDAO`, `WeekDAO`, `MealSlotDAO`, `RefreshTokenDAO`, `UserFavoriteDAO`.
- `db/models/` — SQLAlchemy models: `User`, `Recipe`, `Week`, `MealSlot`, `RefreshToken`, `UserFavorite`.
- `security/` — `hashing.py` (bcrypt), `token_provider.py` (JWT access tokens + hashed refresh tokens).
- `clients/` — External HTTP clients (Google OAuth).
- `config.py` / `constants.py` — Pydantic settings and enums (e.g., `OAuthProvider`).

**Auth flow**: JWT access token in `Authorization` header; refresh token stored hashed in DB and sent as an HTTP-only cookie. Refresh token rotation occurs near expiry (`ROTATE_TOKEN_EXPIRE_DELTA`). Google OAuth uses authorization code exchange via `GoogleAuthClient`.

**IDs**: All primary keys are UUID v7 (time-sortable), generated via `uuid-utils`.

### Frontend (`frontend/src/`)

Feature-based structure under `features/` (auth, recipe, week, mealSlot). Each feature exports its public API via `index.ts`.

- `api/` — Axios-based API client (`client.ts`) and per-domain modules (`auth.ts`, `recipes.ts`, `weeks.ts`, `mealSlots.ts`).
- `domain/` — Shared domain types/interfaces.
- `features/` — Feature modules with `components/` and `composables/`.
- `pages/` — Vue Router page components.
- `router/` — Vue Router config.
- `i18n/` — Internationalization (vue-i18n).

State management uses **Pinia** with `@pinia/colada` for async query state. Forms use **vee-validate** + **zod**. UI components come from **reka-ui** with Tailwind CSS v4.

### Tests

**Backend**: pytest with `pytest-asyncio` (auto mode). Tests mock the `AsyncSession` via `pytest-mock`. Coverage must be 100% (configured in `pyproject.toml`; `main.py`, `config.py`, and `exceptions.py` are omitted from coverage). Fixtures are in `backend/tests/conftest.py`.

**Frontend**: Vitest + `@vue/test-utils`. Tests live in `frontend/src/__tests__/` and per-feature `__tests__/` directories.

### Database Migrations

Alembic migrations are in `backend/migrations/versions/`. After adding/modifying SQLAlchemy models, generate a migration:
```bash
cd backend && alembic revision --autogenerate -m "description"
```
