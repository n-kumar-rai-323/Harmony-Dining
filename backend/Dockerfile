# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
RUN corepack enable

# ---- dependencies (cached while package.json/pnpm-lock.yaml don't change) ----
# Use the repository's explicit dependency build-script allowlist.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build: generate the Prisma client (musl target, matches this image) and compile Nest ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

# ---- runtime ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY docker-entrypoint.sh ./docker-entrypoint.sh
COPY database-url.cjs ./database-url.cjs
RUN chmod +x docker-entrypoint.sh && mkdir -p storage/uploads && chown -R node:node /app
ENV PORT=4100
USER node

EXPOSE 4100
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
