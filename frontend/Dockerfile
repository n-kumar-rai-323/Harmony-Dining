# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- dependencies (cached while package.json/pnpm-lock.yaml don't change) ----
# pnpm refuses to run dependency postinstall scripts (esbuild, tailwind's
# native oxide binary...) until they're approved; approve everything up
# front since this is a controlled build, not an interactive dev machine.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm approve-builds --all && \
    pnpm rebuild

# ---- build ----
# NEXT_PUBLIC_* vars are baked into the client bundle at build time, so they
# must be passed as build args (see docker-compose.prod.yml).
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- runtime: only the standalone server output, no source/node_modules bloat ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
