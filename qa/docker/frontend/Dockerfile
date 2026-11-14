# Export the schema without starting the backend or connecting to its services.
FROM python:3.14-slim AS schema
COPY --from=ghcr.io/astral-sh/uv:0.13.8 /uv /uvx /bin/
WORKDIR /app/backend
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY backend/week_eat_planner ./week_eat_planner
COPY backend/.env.be_test ./.env
RUN .venv/bin/python -c "import json; from pathlib import Path; from week_eat_planner.main import app; Path('/app/openapi.json').write_text(json.dumps(app.openapi()))"

FROM oven/bun:1.3.14 AS bun
FROM node:24-bookworm-slim AS build
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts
# Copy only source inputs so host node_modules, .env and generated files stay out.
COPY frontend/app ./app
COPY frontend/public ./public
COPY frontend/nuxt.config.ts frontend/tsconfig.json frontend/tsconfig.tests.json ./
COPY --from=schema /app/openapi.json ./openapi.json
ENV NUXT_OPENAPI_SCHEMA=/app/openapi.json
ENV NITRO_PRESET=node-server
RUN bun run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
