#!/bin/bash
set -ex

# Wait for the database to be available
wait-for-it.sh db:5432 --timeout=30 --strict -- echo "Database is up"

# Run alembic upgrade
#sed -i -e "s|driver://user:pass@localhost/dbname|postgresql+asyncpg://wep:wep@db:5432/wep|g" alembic.ini
alembic upgrade head

# Launch uvicorn
uvicorn week_eat_planner.main:app --host 0.0.0.0 --port 8000 --root-path /api
