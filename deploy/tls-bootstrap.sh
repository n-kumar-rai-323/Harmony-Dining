#!/bin/sh
set -eu
: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL}"
compose() { docker compose -f docker-compose.prod.yml "$@"; }
# A standalone temporary container serves the challenge without TLS certificates.
name="harmony-acme-bootstrap-$$"
cleanup() { docker rm -f "$name" > /dev/null 2>&1 || true; }
trap cleanup EXIT HUP INT TERM
compose create certbot
certbot_id=$(compose ps -aq certbot)
test -n "$certbot_id"
docker run -d --name "$name" -p 80:80 --volumes-from "$certbot_id":ro \
  -v "$(pwd)/deploy/nginx/bootstrap.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine > /dev/null
compose run --rm certbot certonly --webroot -w /var/www/certbot \
  --non-interactive --agree-tos --email "$CERTBOT_EMAIL" \
  -d harmonydining.com.np -d www.harmonydining.com.np
echo 'Certificates issued. Start the production stack after this script exits.'
