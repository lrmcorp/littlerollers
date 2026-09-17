#!/bin/bash
set -e

echo "==> [DailyDose] Ensuring upload storage directories exist..."
mkdir -p /app/data/private /app/data/public-uploads /app/.local-data/public-uploads 2>/dev/null || true

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

# Wait for either process to terminate; if one crashes, trigger cleanup
wait -n "$API_PID" "$WEB_PID"
EXIT_CODE=$?
echo "==> [DailyDose] A child process exited with code $EXIT_CODE, shutting down container..."
cleanup
