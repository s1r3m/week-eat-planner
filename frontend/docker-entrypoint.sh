#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -ex

# If node_modules exists and is up-to-date, yarn will do nothing and exit quickly.
# If node_modules is missing or outdated, yarn will install/update dependencies.
echo "Ensuring dependencies are up to date..."
corepack enable
yarn install --frozen-lockfile

# Now, execute the main command (CMD) for the container.
echo "Dependencies are up to date. Starting the application..."
exec "$@"