#!/bin/sh
set -e

echo "==> [DailyDose] Ensuring private upload storage exists..."
mkdir -p /app/data/private

echo "==> [DailyDose] Running Prisma migrations..."
node apps/api/node_modules/prisma/build/index.js migrate deploy --schema apps/api/prisma/schema.prisma || {
  echo "==> [DailyDose] Warning: Migration encountered an issue, proceeding..."
}

echo "==> [DailyDose] Starting NestJS API on 127.0.0.1:32121..."
PORT=32121 node apps/api/dist/main.js &
API_PID=$!

echo "==> [DailyDose] Starting Next.js Web on 0.0.0.0:32120..."
cd /app/apps/web
PORT=32120 HOSTNAME=0.0.0.0 API_BASE_URL=http://127.0.0.1:32121 node .next/standalone/apps/web/server.js &
WEB_PID=$!

cleanup() {
  echo "==> [DailyDose] Received shutdown signal, stopping services..."
  kill -TERM "$API_PID" 2>/dev/null || true
  kill -TERM "$WEB_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
  wait "$WEB_PID" 2>/dev/null || true
  exit 0
}

trap cleanup TERM INT QUIT

wait "$API_PID" "$WEB_PID"
