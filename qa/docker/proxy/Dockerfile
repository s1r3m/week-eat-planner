FROM python:3.14-slim

COPY --from=ghcr.io/astral-sh/uv:0.13.8 /uv /uvx /bin/

WORKDIR /app

COPY backend/pyproject.toml backend/uv.lock /app/backend/

RUN cd backend && uv sync --frozen --no-dev --no-install-project

COPY backend /app/backend
COPY qa/docker/proxy /app/proxy

ENV PYTHONPATH=/app/backend

CMD ["backend/.venv/bin/python", "-m", "proxy.server"]
