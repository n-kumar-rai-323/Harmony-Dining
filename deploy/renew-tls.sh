#!/bin/sh
set -eu
docker compose -f docker-compose.prod.yml run --rm certbot renew --webroot -w /var/www/certbot --non-interactive
docker compose -f docker-compose.prod.yml exec -T nginx nginx -t
docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload
