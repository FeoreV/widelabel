# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat && \
    corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json  ./packages/types/
COPY apps/backend/package.json    ./apps/backend/

RUN pnpm install --frozen-lockfile --ignore-scripts

# ─── Stage 2: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat && \
    corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY --from=deps /app/node_modules         ./node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/packages/types/node_modules  ./packages/types/node_modules
COPY --from=deps /app/apps/backend/node_modules    ./apps/backend/node_modules

COPY packages/config/ ./packages/config/
COPY packages/types/  ./packages/types/
COPY apps/backend/    ./apps/backend/
COPY turbo.json       ./

RUN pnpm --filter @wide-label/config build && \
    pnpm --filter @wide-label/types  build && \
    cd apps/backend && pnpm exec medusa build

# ─── Stage 3: production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

RUN apk add --no-cache libc6-compat && \
    corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json  ./packages/types/
COPY apps/backend/package.json    ./apps/backend/

COPY --from=builder /app/node_modules         ./node_modules
COPY --from=builder /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=builder /app/packages/types/node_modules  ./packages/types/node_modules
COPY --from=builder /app/apps/backend/node_modules    ./apps/backend/node_modules

COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/config/src  ./packages/config/src
COPY --from=builder /app/packages/types/dist  ./packages/types/dist
COPY --from=builder /app/packages/types/src   ./packages/types/src
COPY --from=builder /app/apps/backend/medusa-config.ts ./apps/backend/medusa-config.ts
COPY --from=builder /app/apps/backend/medusa-config.js ./apps/backend/medusa-config.js
COPY --from=builder /app/apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY --from=builder /app/apps/backend/tsconfig.json ./tsconfig.json
COPY --from=builder /app/apps/backend/src     ./apps/backend/src
COPY --from=builder /app/apps/backend/.medusa  ./apps/backend/.medusa
COPY --from=builder /app/apps/backend/.medusa/server/public ./apps/backend/public

WORKDIR /app/apps/backend

EXPOSE 9000

HEALTHCHECK --interval=10s --timeout=5s --start-period=180s --retries=20 \
  CMD wget -qO- http://localhost:9000/health || exit 1

CMD ["pnpm", "exec", "medusa", "start"]
