#!/usr/bin/env node
/**
 * Mengecilkan node_modules untuk image runtime.
 *
 * Image runtime hanya menjalankan API (dist) dan server Next.js standalone, yang membawa dependensinya sendiri.
 * Di dalam monorepo pnpm, store `node_modules/.pnpm` memuat juga paket pengembangan dan paket khusus web
 * (next, swc, playwright, vitest, tailwind, dst) yang tidak pernah dimuat saat API berjalan.
 *
 * Cara kerja: kumpulkan semua paket yang dapat dicapai dari dependensi API (produksi, ditambah `prisma` dan
 * `tsx` yang dipakai skrip start) dan paket workspace, ikuti symlink antarpaket pnpm, lalu hapus sisanya.
 * Karena yang dibuang hanyalah paket yang tidak terhubung ke akar mana pun, API tidak bisa kehilangan modul
 * yang dibutuhkannya; skrip ini juga memverifikasi akhirnya dan gagal (exit 1) bila ada yang hilang.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] ?? '/app');
const pnpmDir = path.join(root, 'node_modules', '.pnpm');

const DEV_ONLY = new Set(['@nestjs/cli', '@nestjs/testing', 'jest', 'ts-jest', 'typescript']);
const isDevOnly = (name) => DEV_ONLY.has(name) || name.startsWith('@types/');

function* links(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith('@') && entry.isDirectory()) {
      for (const inner of fs.readdirSync(full, { withFileTypes: true })) {
        yield { name: `${entry.name}/${inner.name}`, full: path.join(full, inner.name) };
      }
    } else if (entry.name !== '.bin' && entry.name !== '.pnpm') {
      yield { name: entry.name, full };
    }
  }
}

/** Nama direktori `.pnpm/<x>` yang memuat target symlink, atau null bila bukan paket di store. */
function storeEntryOf(file) {
  let real;
  try {
    real = fs.realpathSync(file);
  } catch {
    return null; // symlink putus
  }
  const rel = path.relative(pnpmDir, real);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.split(path.sep)[0];
}

const keep = new Set();
const queue = [];
const visit = (entry) => {
  if (entry && !keep.has(entry)) {
    keep.add(entry);
    queue.push(entry);
  }
};

// Akar: dependensi API (tanpa paket pengembangan murni) dan dependensi paket workspace.
const rootDirs = ['apps/api', 'packages/config', 'packages/notification-core'].map((p) =>
  path.join(root, p, 'node_modules'),
);
for (const dir of rootDirs) {
  for (const { name, full } of links(dir)) {
    if (!isDevOnly(name)) visit(storeEntryOf(full));
  }
}

// Ikuti symlink antarpaket di dalam store pnpm.
while (queue.length > 0) {
  const entry = queue.pop();
  for (const { full } of links(path.join(pnpmDir, entry, 'node_modules'))) visit(storeEntryOf(full));
}

let removed = 0;
for (const entry of fs.readdirSync(pnpmDir)) {
  if (entry === 'node_modules' || entry.endsWith('.yaml') || keep.has(entry)) continue;
  fs.rmSync(path.join(pnpmDir, entry), { recursive: true, force: true });
  removed += 1;
}

// Buang symlink putus yang tersisa (hoist `.pnpm/node_modules`, `node_modules` akar, dan folder aplikasi).
const dropBroken = (dir) => {
  for (const { full } of links(dir)) {
    try {
      fs.statSync(full);
    } catch {
      fs.rmSync(full, { force: true });
    }
  }
};
[path.join(pnpmDir, 'node_modules'), path.join(root, 'node_modules')].forEach(dropBroken);

// Verifikasi: setiap dependensi API, ditambah prisma dan tsx, harus tetap dapat di-resolve.
const apiPackage = JSON.parse(fs.readFileSync(path.join(root, 'apps/api/package.json'), 'utf8'));
const needed = [...Object.keys(apiPackage.dependencies ?? {}), 'prisma', 'tsx'];
const apiRequire = require('node:module').createRequire(path.join(root, 'apps/api/package.json'));
const missing = needed.filter((name) => {
  try {
    apiRequire.resolve(`${name}/package.json`);
    return false;
  } catch (error) {
    // Paket yang membatasi `exports` tidak membuka package.json; cukup pastikan direktorinya ada.
    return !fs.existsSync(path.join(root, 'apps/api/node_modules', name));
  }
});
if (missing.length > 0) {
  console.error(`Dependensi runtime hilang setelah pemangkasan: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`node_modules dikecilkan: ${keep.size} paket dipertahankan, ${removed} dibuang.`);
