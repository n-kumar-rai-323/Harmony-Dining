# Harmony Dining

Restaurant website and administration system. Two independently installed applications:

| Directory | Responsibility |
| --- | --- |
| `frontend/src/app` | Next.js public pages, administration routes and routing proxy |
| `frontend/src/components` | Public and administration UI |
| `backend/src` | NestJS feature modules, authentication, permissions and API |
| `backend/prisma` | PostgreSQL schema, versioned migrations and seed |
| `deploy/nginx` | TLS reverse proxy and uploaded media serving |

## Local development

Use the pnpm version declared in each package.json. Copy each application's
`.env.example` to `backend/.env` and `frontend/.env.local` respectively.
Start PostgreSQL with `docker compose -f backend/docker-compose.yml up -d`.
In backend run `pnpm install`, `pnpm prisma:generate`, `pnpm prisma:deploy`,
`pnpm db:seed`, then `pnpm start:dev`. In frontend run `pnpm install` and `pnpm dev`.
Defaults: website port 3000, API port 4100, database port 5433.

## Database structure

- Identity: admin users, hashed-token sessions, permissions, role grants and user overrides.
- Content: menu categories/items/variants, media, galleries, events and review photos.
- Bookings: reservations and event enquiries each have status history; reservation
  settings and disabled dates control availability. Slot creation uses a transaction
  and PostgreSQL advisory lock to prevent capacity overselling.
- CMS: JSON content in site settings, homepage sections, page headers and promotions.
- Operations: contact messages, notifications/read state, mail logs and audit logs.

Content uses soft deletion. Foreign keys protect referenced media; money uses fixed
precision decimals. SQL migrations add integrity checks beyond Prisma's schema.
Actor ID fields without relations are historical identifiers; do not cascade-delete
booking history or audit records when removing an administrator.

## Production deployment

1. Back up PostgreSQL (`pg_dump -Fc`) and the uploaded media volume to encrypted
   off-host storage. Verify a restore into a separate database before release.
2. Copy root `.env.example` to `.env`, and `backend/.env.production.example` to
   `backend/.env.production`. Set real HTTPS URLs, CORS origins, a random session
   secret (32+ characters), secure session cookies, and unique administrator credentials.
   The API now rejects insecure production cookies and placeholder session secrets.
   Set separate owner and API database passwords in root `.env`. Compose supplies
   the component credentials; the entrypoint URL-encodes them without printing secrets.
   Use 32+ characters for both passwords. Single-quote values containing `$` in `.env`
   to prevent Compose interpolation. The example passwords intentionally fail startup.
3. With DNS pointing to the host and port 80 free, run
   `CERTBOT_EMAIL=you@example.com sh deploy/tls-bootstrap.sh` before starting nginx.
   Certificate paths and server names target `harmonydining.com.np`; change both
   nginx configurations and the bootstrap script for another domain.
4. Run `docker compose -f docker-compose.prod.yml up -d --build`.
   A one-off migration container runs with the database owner account. A provisioning
   container then grants the API account data access without DDL, migration-history
   access, or audit-log modification/deletion. The API starts only after both succeed;
   frontend startup waits for API readiness. This also upgrades existing volumes.
   When upgrading an older root-run container, first fix existing upload ownership:
   `docker compose -f docker-compose.prod.yml run --rm --user root --entrypoint sh backend -c 'chown -R node:node /app/storage/uploads'`.
5. On initial provisioning, run `docker compose -f docker-compose.prod.yml exec
   backend sh ./docker-entrypoint.sh pnpm db:seed` with your chosen seed credentials.
   The entrypoint assembles the restricted database URL for this command. Production refuses the
   example administrator password and skips demo galleries/events unless
   `SEED_DEMO_CONTENT=true`. Review default CMS content. Remove seed passwords afterward.
6. Verify `/api/health/ready`, admin login, reservation submission and uploaded images.
   Install the jobs in `deploy/cron.example` with the host's alert delivery configured.

The integrity migration intentionally fails if existing rows violate its checks;
inspect and repair invalid data rather than deleting it or marking a failed migration
as successful. Index creation takes table locks; schedule a maintenance window for
large databases. Do not run e2e tests against production: they write and remove fixtures.

## Operations and validation

`BACKUP_DIR=/secured/path sh deploy/backup.sh` captures database and uploaded media,
with checksums and owner-only permissions. `sh deploy/restore-check.sh /backup/path`
restores into an isolated disposable PostgreSQL container and checks the media archive.
Run backups during a quiet period or maintenance window to avoid media deletions
between the database snapshot and file copy. Copy archives to encrypted off-host
storage with a retention policy; a local copy alone does not protect against host loss.

`sh deploy/renew-tls.sh` renews certificates and reloads validated nginx configuration.
`PUBLIC_URL=https://www.harmonydining.com.np sh deploy/check-health.sh` checks the
public page, database readiness and stalled mail. Exit failures must trigger host alerts.
`sh deploy/cleanup-sessions.sh` removes expired/revoked sessions without touching bookings.
`sh deploy/verify-db-permissions.sh` verifies restricted privileges and application
read/write access in a transaction that rolls back all probe data. Run this after each
schema upgrade; the CI container check also runs it. Keep `APP_DB_USER` dedicated to
this application and distinct from the owner account; do not reuse an existing owner role.

Mail uses a database outbox: booking acknowledgements are enqueued in the booking
transaction. A worker retries up to five times with backoff and a lease. SMTP requires
TLS and has timeouts; production refuses the log-only driver. Delivered HTML is cleared.
Delivery is at-least-once: a crash after SMTP acceptance can cause a duplicate on retry.
Messages exhausted after five attempts and old rows without a retry payload need operator
attention. Configure SMTP credentials and verify actual delivery with your provider.

## GitHub Actions deployment to an existing EC2 instance

Pull requests and pushes to `main` run lint, type checks, tests, builds, and an
isolated Docker Compose smoke test. The **CI/CD** workflow also supports a manual
run. Production deployment runs only for `main`, after all checks pass.

1. On EC2, verify that the deployment account can fetch `origin/main` and run
   Docker with non-interactive sudo. If the live folder came from an archive
   and lacks `.git`, create a separate checkout and copy the two runtime env files:

   ```sh
   mkdir -p "$HOME/harmony-release"
   git clone --branch main https://github.com/n-kumar-rai-323/Harmony-Dining.git "$HOME/harmony-release/Harmony-Dining"
   cp -pn "$HOME/Harmony-Dining/.env" "$HOME/harmony-release/Harmony-Dining/.env"
   cp -pn "$HOME/Harmony-Dining/backend/.env.production" "$HOME/harmony-release/Harmony-Dining/backend/.env.production"
   ```

   Keep the checkout's tracked working tree clean. Prepare the production env
   files described above, preserving the existing PostgreSQL owner, password,
   database name, and domain. Add the separate API account credentials and
   SMTP settings required by this release. Check free disk space for the
   database and uploads backup plus both image builds before the first run.
2. Under **Settings → Environments**, create `production`. Add environment
   secrets `EC2_HOST` (the Elastic IP or DNS name), `EC2_USER` (the actual SSH
   username), `EC2_SSH_KEY` (a dedicated deployment private key whose public key
   is installed on EC2), and `EC2_HOST_FINGERPRINT` (the trusted SHA256 host-key
   fingerprint from the EC2 console or an existing trusted session). The deploy
   runner must be able to reach the instance over SSH.
3. Set the repository Actions variable `EC2_APP_DIR` to
   `/home/ubuntu/harmony-release/Harmony-Dining` if you used the separate
   checkout above. Deployment explicitly uses the existing `harmony-dining`
   Compose project, including its database, upload, and certificate volumes.
   For deployments with a different existing project name, set the repository
   Actions variable `EC2_COMPOSE_PROJECT`. Set the repository Actions variable
   `EC2_DEPLOY_ENABLED` to `true` once the host and secrets are ready. Run
   **Actions → CI/CD → Run workflow** on `main` for the first deployment.

Deployment backs up the database and uploads under `/var/backups/harmony`,
builds the images sequentially, applies the tested revision, waits for Compose
health, and validates and reloads nginx. If `main` advances before the deploy
starts, that run skips deployment and the newer revision goes through its own CI.

Rate limits are process-local: run one API replica until shared storage is implemented.
Define business/legal retention for contact details, failed email payloads and audit
records. Review legal copy and default content before public launch. Host alert delivery,
off-host backup storage and real certificates require access to the deployment environment.
