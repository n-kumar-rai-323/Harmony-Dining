#!/bin/sh
set -e
if [ -n "${PGHOST:-}" ]; then
  DATABASE_URL=$(node ./database-url.cjs)
  export DATABASE_URL
fi

if [ "${RUN_MIGRATIONS:-true}" = true ]; then
  echo "Applying database migrations..."
  ./node_modules/.bin/prisma migrate deploy
fi

exec "$@"
