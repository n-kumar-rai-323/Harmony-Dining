#!/bin/sh
# Run from the repository root. BACKUP_DIR must be on secured storage.
set -eu
umask 077
: "${BACKUP_DIR:?Set BACKUP_DIR to an absolute backup directory}"
case "$BACKUP_DIR" in /*) ;; *) echo 'BACKUP_DIR must be absolute' >&2; exit 1;; esac
mkdir -p "$BACKUP_DIR"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
target="$BACKUP_DIR/$stamp"
mkdir "$target"
compose() { docker compose -f docker-compose.prod.yml "$@"; }
compose exec -T postgres sh -ec 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$target/database.dump.partial"
test -s "$target/database.dump.partial"
mv "$target/database.dump.partial" "$target/database.dump"
# Media names are immutable; capture uploads after the database snapshot.
compose exec -T backend tar -C /app/storage/uploads -czf - . > "$target/uploads.tar.gz.partial"
mv "$target/uploads.tar.gz.partial" "$target/uploads.tar.gz"
(cd "$target" && sha256sum database.dump uploads.tar.gz > SHA256SUMS)
printf '%s\n' "$target"
# Retention is deliberately managed by the off-host backup destination.
