#!/bin/sh
# Runs with the database owner's credentials after migrations, never in the API.
set -eu
: "${APP_DB_USER:?Set APP_DB_USER}"
: "${APP_DB_PASSWORD:?Set APP_DB_PASSWORD}"
: "${PGUSER:?Set PGUSER to the migration owner}"
test "$APP_DB_USER" != "$PGUSER" || { echo 'Runtime and migration users must differ' >&2; exit 1; }
test "${#APP_DB_PASSWORD}" -ge 32 || { echo 'APP_DB_PASSWORD must have at least 32 characters' >&2; exit 1; }
case "$APP_DB_PASSWORD" in *replace-with*) echo 'Replace the example APP_DB_PASSWORD' >&2; exit 1;; esac
case "$APP_DB_USER" in *[!a-zA-Z0-9_]*|'') echo 'APP_DB_USER must use letters, digits and underscores' >&2; exit 1;; esac
psql -X -v ON_ERROR_STOP=1 --set=app_user="$APP_DB_USER" --set=app_password="$APP_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN', :'app_user')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user') \gexec
SELECT format('ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', :'app_user', :'app_password') \gexec
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'app_user') \gexec
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'app_user') \gexec
SELECT format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', :'app_user') \gexec
SELECT format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', :'app_user') \gexec
SELECT format('REVOKE ALL ON TABLE public._prisma_migrations FROM %I', :'app_user') \gexec
SELECT format('REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public.audit_logs FROM %I', :'app_user') \gexec
SQL
# Block API startup if an existing account still inherits elevated privileges.
PGUSER="$APP_DB_USER" PGPASSWORD="$APP_DB_PASSWORD" sh "$(dirname "$0")/verify-db-role.sh"
