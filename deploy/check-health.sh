#!/bin/sh
set -eu
: "${PUBLIC_URL:?Set PUBLIC_URL to your HTTPS website origin}"
case "$PUBLIC_URL" in https://*) ;; *) echo 'HTTPS URL required' >&2; exit 1;; esac
curl --fail --silent --show-error --max-time 20 "$PUBLIC_URL/api/health/ready"
curl --fail --silent --show-error --max-time 20 --output /dev/null "$PUBLIC_URL/"
docker compose -f docker-compose.prod.yml exec -T postgres sh -ec \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -Atc "SELECT count(*) FROM mail_logs WHERE status <> '\''SENT'\'' AND (attempts >= 5 OR \"createdAt\" < now() - interval '\''1 hour'\'');"' |
  { read -r failed; test "$failed" = 0 || { echo "Mail backlog requires attention: $failed" >&2; exit 1; }; }
