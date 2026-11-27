#!/bin/sh
# Restores to a disposable isolated container; never touches the application DB.
set -eu
archive=${1:?Usage: sh deploy/restore-check.sh /absolute/backup/directory}
(cd "$archive" && sha256sum -c SHA256SUMS)
tar -tzf "$archive/uploads.tar.gz" > /dev/null
name="harmony-restore-check-$$"
cleanup() { docker rm -f "$name" > /dev/null 2>&1 || true; }
trap cleanup EXIT HUP INT TERM
docker run -d --name "$name" --network none -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine > /dev/null
attempt=0
until docker exec "$name" pg_isready -U postgres > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  test "$attempt" -lt 30 || exit 1
  sleep 1
done
docker exec "$name" createdb -U postgres restore_check
docker exec -i "$name" pg_restore -U postgres -d restore_check --no-owner --no-privileges --exit-on-error < "$archive/database.dump"
docker exec "$name" psql -U postgres -d restore_check -v ON_ERROR_STOP=1 -c 'SELECT count(*) FROM admin_users; SELECT count(*) FROM _prisma_migrations;'
echo 'Database restore and media archive checks passed.'
