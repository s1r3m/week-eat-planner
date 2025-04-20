#!/bin/bash

# Wait for the database to be available
./wait-for-it.sh db:5432 --timeout=30 --strict -- echo "Database is up"

# Run alembic upgrade
alembic upgrade head

# Launch uvicorn
uv run uvicorn week_eat_planner.main:app --host 0.0.0.0 --port 8000 --root-path /api
