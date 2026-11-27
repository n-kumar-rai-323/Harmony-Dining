#!/bin/sh
# Use the API account's PGUSER/PGPASSWORD, never the database owner.
set -eu
psql -X -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND
      (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)) THEN
    RAISE EXCEPTION 'Runtime account has administrative privileges';
  END IF;
  BEGIN
    CREATE TABLE public.__harmony_permission_probe (id integer);
    RAISE EXCEPTION 'Runtime account can create tables';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM 1 FROM public._prisma_migrations;
    RAISE EXCEPTION 'Runtime account can access migration history';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    DELETE FROM public.audit_logs WHERE false;
    RAISE EXCEPTION 'Runtime account can delete audit records';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
INSERT INTO site_settings (key, value, "updatedAt") VALUES
  ('__harmony_permission_probe', '{}'::jsonb, now());
UPDATE site_settings SET value = '{"probe":true}'::jsonb WHERE key = '__harmony_permission_probe';
SELECT value FROM site_settings WHERE key = '__harmony_permission_probe';
DELETE FROM site_settings WHERE key = '__harmony_permission_probe';
ROLLBACK;
SQL
