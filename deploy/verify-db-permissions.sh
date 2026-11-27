#!/bin/sh
set -eu
docker compose -f docker-compose.prod.yml run --rm --no-deps database-permissions \
  sh -ec 'export PGUSER="$APP_DB_USER" PGPASSWORD="$APP_DB_PASSWORD"; exec sh /verify-db-role.sh'
