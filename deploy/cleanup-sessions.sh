#!/bin/sh
set -eu
# Only unusable sessions are purged. Business and audit retention needs a policy.
docker compose -f docker-compose.prod.yml exec -T postgres sh -ec \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -c "DELETE FROM sessions WHERE \"expiresAt\" < now() OR \"revokedAt\" < now() - interval '\''7 days'\'';"'
