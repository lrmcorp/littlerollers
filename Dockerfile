FROM node:24-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@11.7.0 --activate

# Layer caching: copy workspace manifest and package definitions first
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/
COPY apps/web/package.json ./apps/web/
COPY packages/api-client-ts/package.json ./packages/api-client-ts/
COPY packages/config/package.json ./packages/config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/notification-core/package.json ./packages/notification-core/
COPY packages/test-utils/package.json ./packages/test-utils/

RUN pnpm install --frozen-lockfile

# Generate Prisma Client before copying all source code to leverage caching
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm --filter @dailydose/api exec prisma generate --schema prisma/schema.prisma

# Copy remaining project source code
COPY . .

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ARG API_BASE_URL="http://api:32121"
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED=false
ENV API_BASE_URL=$API_BASE_URL

RUN pnpm build \
    && install -d apps/web/.next/standalone/apps/web/.next/static \
    && install -d apps/web/.next/standalone/apps/web/public \
    && cp -a apps/web/.next/static/. apps/web/.next/standalone/apps/web/.next/static/ \
    && cp -a apps/web/public/. apps/web/.next/standalone/apps/web/public/ \
    && rm -rf .turbo apps/web/.next/cache \
    && chmod +x docker-entrypoint.sh

FROM node:24-bookworm-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 dailydose \
    && useradd --system --uid 1001 --gid dailydose dailydose

COPY --from=builder --chown=dailydose:dailydose /app /app

RUN mkdir -p /app/.local-data/public-uploads /app/data/private /app/data/public-uploads \
    && chown -R dailydose:dailydose /app

USER dailydose

EXPOSE 32120

CMD ["/app/docker-entrypoint.sh"]

