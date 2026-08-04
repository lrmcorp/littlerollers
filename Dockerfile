FROM node:24-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@11.7.0 --activate

COPY . .
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ARG API_BASE_URL="http://api:32121"
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED=false
ENV API_BASE_URL=$API_BASE_URL

RUN pnpm --filter @dailydose/api exec prisma generate --schema prisma/schema.prisma \
    && pnpm build

FROM node:24-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@11.7.0 --activate \
    && groupadd --system --gid 1001 dailydose \
    && useradd --system --uid 1001 --gid dailydose dailydose

COPY --from=builder --chown=dailydose:dailydose /app /app

USER dailydose

CMD ["node", "apps/api/dist/main.js"]
