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
    console.log('==> [DailyDose] Master data exists (' + c + ' branches), ensuring default heroImageKeys...');
    try {
      const defaults = [
        { code: 'DD-GG', key: 'branches/green-garden.png' },
        { code: 'DD-MK', key: 'branches/muara-karang.png' },
        { code: 'DD-SBY', key: 'branches/graha-family-surabaya.png' },
        { code: 'DD-UNTAR', key: 'branches/untar-kampus-2.png' },
        { code: 'DD-PIK2', key: 'branches/orange-groves-pik2.png' },
      ];
      for (const d of defaults) {
        await p.cabang.updateMany({ where: { code: d.code, heroImageKey: null }, data: { heroImageKey: d.key } });
      }
      await p.jenisKelas.updateMany({ where: { code: 'REFORMER', heroImageKey: null }, data: { heroImageKey: 'classes/reformer-pilates.png' } });
      await p.jenisKelas.updateMany({ where: { code: 'MAT', heroImageKey: null }, data: { heroImageKey: 'classes/mat-pilates.png' } });
      const unassignedUsers = await p.user.findMany({ where: { username: null }, select: { id: true, email: true, displayName: true } });
      for (const u of unassignedUsers) {
        let cand = (u.email && u.email.includes('@')) ? u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '') : (u.displayName ? u.displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.-]/g, '') : 'user_' + u.id.slice(0, 6));
        if (!cand || cand.length < 3) cand = 'user_' + u.id.slice(0, 6);
        let finalU = cand, cnt = 1;
        while (await p.user.findFirst({ where: { username: finalU, NOT: { id: u.id } } })) { finalU = cand + '_' + (cnt++); }
        await p.user.update({ where: { id: u.id }, data: { username: finalU } });
      }
    } catch (e) {
      console.warn('==> [DailyDose] Backfill notice:', e.message);
    }
  }
  await p.\$disconnect();
}).catch(err => {
  console.warn('==> [DailyDose] Master data check skipped:', err.message);
});
" || true

echo "==> [DailyDose] Starting NestJS API on 127.0.0.1:32121 (heap limit: 256MB)..."
PORT=32121 node --max-old-space-size=256 apps/api/dist/main.js &
API_PID=$!

echo "==> [DailyDose] Starting Next.js Web on 0.0.0.0:32120 (heap limit: 256MB)..."
cd /app/apps/web
PORT=32120 HOSTNAME=0.0.0.0 API_BASE_URL=http://127.0.0.1:32121 node --max-old-space-size=256 .next/standalone/apps/web/server.js &
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
