// Memastikan MySQL terjangkau sebelum suite integrasi berjalan, supaya database yang mati
// menghasilkan SATU pesan jelas, bukan puluhan kegagalan timeout yang membingungkan.
const fs = require('fs');
const net = require('net');
const path = require('path');

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key && !(key in process.env)) {
      process.env[key] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
}

function tcpReachable(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

module.exports = async function globalSetup() {
  loadEnvFile();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Tes integrasi butuh DATABASE_URL (isi di .env root). Untuk tes tanpa database jalankan: pnpm --filter @dailydose/api test:unit',
    );
  }
  const { hostname, port } = new URL(url);
  const target = `${hostname}:${port || 3306}`;
  if (!(await tcpReachable(hostname, Number(port || 3306), 5_000))) {
    throw new Error(
      `Tes integrasi butuh MySQL di ${target} (dari DATABASE_URL), tetapi tidak terjangkau. ` +
        'Nyalakan database, atau jalankan tes tanpa database: pnpm --filter @dailydose/api test:unit',
    );
  }

  // Login + satu query: memvalidasi kredensial dan memanaskan koneksi pertama yang lambat.
  const { PrismaClient } = require('@prisma/client');
  const db = new PrismaClient();
  try {
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout 30 detik')), 30_000)),
    ]);
  } catch (error) {
    throw new Error(`MySQL di ${target} terjangkau tetapi query pemeriksaan gagal: ${error.message}`);
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
};
