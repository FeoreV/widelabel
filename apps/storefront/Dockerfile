# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json  ./packages/types/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── Stage 2: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY --from=deps /app/node_modules             ./node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/packages/types/node_modules  ./packages/types/node_modules
COPY --from=deps /app/apps/storefront/node_modules ./apps/storefront/node_modules

COPY packages/config/ ./packages/config/
COPY packages/types/  ./packages/types/
COPY apps/storefront/ ./apps/storefront/
COPY turbo.json       ./

# Build dependencies first
RUN pnpm --filter @wide-label/config build && \
    pnpm --filter @wide-label/types  build

# Next.js build — runtime env vars are injected at container start, not baked in.
# NEXT_PUBLIC_* vars that are truly build-time must be passed here as --build-arg.
# All other env is passed at runtime via Docker Compose env_file.
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:9000
ARG NEXT_PUBLIC_CDEK_WIDGET_URL=https://widget.cdek.ru
ARG NEXT_PUBLIC_DEFAULT_LOCALE=ru
ARG NEXT_PUBLIC_SENTRY_DSN=

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_CDEK_WIDGET_URL=$NEXT_PUBLIC_CDEK_WIDGET_URL
ENV NEXT_PUBLIC_DEFAULT_LOCALE=$NEXT_PUBLIC_DEFAULT_LOCALE
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

RUN pnpm --filter @wide-label/storefront build

# ─── Stage 3: production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json  ./packages/types/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile --ignore-scripts --prod

COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/config/src  ./packages/config/src
COPY --from=builder /app/packages/types/dist  ./packages/types/dist
COPY --from=builder /app/packages/types/src   ./packages/types/src
COPY --from=builder /app/apps/storefront/.next/standalone ./
COPY --from=builder /app/apps/storefront/.next/static     ./apps/storefront/.next/static
COPY --from=builder /app/apps/storefront/public           ./apps/storefront/public

WORKDIR /app/apps/storefront

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
