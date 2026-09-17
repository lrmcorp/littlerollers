#!/bin/bash
set -e

echo "==> [DailyDose] Ensuring upload storage directories exist..."
mkdir -p /app/data/private /app/data/public-uploads /app/.local-data/public-uploads 2>/dev/null || true

echo "==> [DailyDose] Synchronizing database schema (Prisma db push)..."
node apps/api/node_modules/prisma/build/index.js db push --schema apps/api/prisma/schema.prisma --skip-generate --accept-data-loss || {
  echo "==> [DailyDose] Warning: Database schema sync encountered an issue, proceeding..."
}

echo "==> [DailyDose] Checking master data..."
node -e "
const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const p = new PrismaClient();
p.cabang.count().then(async c => {
  if (c === 0) {
    console.log('==> [DailyDose] Database is fresh (0 branches found), seeding initial master data...');
    try {
      require('child_process').execSync('node --import ./apps/api/node_modules/tsx/dist/loader.mjs apps/api/prisma/seed.ts', { stdio: 'inherit' });
    } catch (e) {
      console.warn('==> [DailyDose] Warning: Seeder execution notice:', e.message);
    }
  } else {
    console.log('==> [DailyDose] Master data exists (' + c + ' branches), skipping seed.');
  }
  await p.\$disconnect();
}).catch(err => {
  console.warn('==> [DailyDose] Master data check skipped:', err.message);
});
" || true

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
