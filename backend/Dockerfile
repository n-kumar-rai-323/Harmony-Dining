# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- dependencies (cached while package.json/pnpm-lock.yaml don't change) ----
# pnpm refuses to run dependency postinstall scripts (sharp, @prisma/client,
# prisma engines...) until they're approved; approve everything up front
# since this is a controlled build, not an interactive dev machine.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm approve-builds --all && \
    pnpm rebuild

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
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && mkdir -p storage/uploads

EXPOSE 4100
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
