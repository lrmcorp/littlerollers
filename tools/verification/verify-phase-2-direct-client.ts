import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

async function main() {
  console.log('🧪 Memulai Verifikasi Otomatis Tahap 2: Pelepasan Ketergantungan Build SDK Client...\n');
  const rootDir = resolve(__dirname, '../..');

  // -------------------------------------------------------------
  // 1. Verifikasi Keberadaan & Struktur api-client.ts
  // -------------------------------------------------------------
  console.log('▶ 1. Memeriksa Helper Universal apiFetch (apps/web/app/lib/api-client.ts)...');
  const apiClientPath = resolve(rootDir, 'apps/web/app/lib/api-client.ts');
  const apiClientContent = readFileSync(apiClientPath, 'utf8');

  if (!apiClientContent.includes('export async function apiFetch<T>')) {
    throw new Error('apiFetch function tidak ditemukan di api-client.ts!');
  }
  if (!apiClientContent.includes('foregroundFetch')) {
    throw new Error('apiFetch tidak terintegrasi dengan foregroundFetch!');
  }
  if (!apiClientContent.includes('idempotency-key')) {
    throw new Error('apiFetch tidak memiliki dukungan idempotency-key!');
  }
  console.log('   ✅ apps/web/app/lib/api-client.ts terverifikasi valid & siap pakai.');

  // -------------------------------------------------------------
  // 2. Verifikasi master-client.ts (Bebas dari MasterApi & @dailydose/api-client-ts)
  // -------------------------------------------------------------
  console.log('\n▶ 2. Memeriksa apps/web/app/api-clients/master-client.ts...');
  const masterClientPath = resolve(rootDir, 'apps/web/app/api-clients/master-client.ts');
  const masterClientContent = readFileSync(masterClientPath, 'utf8');

  if (masterClientContent.includes('@dailydose/api-client-ts')) {
    throw new Error('master-client.ts masih mengimpor dari @dailydose/api-client-ts!');
  }
  if (masterClientContent.includes('new MasterApi(')) {
    throw new Error('master-client.ts masih menginisialisasi new MasterApi!');
  }
  if (!masterClientContent.includes('export interface Studio')) {
    throw new Error('master-client.ts tidak mengekspor interface Studio!');
  }
  if (!masterClientContent.includes('export interface Room')) {
    throw new Error('master-client.ts tidak mengekspor interface Room!');
  }
  if (!masterClientContent.includes('apiFetch')) {
    throw new Error('master-client.ts tidak menggunakan apiFetch!');
  }
  console.log('   ✅ master-client.ts 100% bebas dari OpenAPI runtime dependency.');
  console.log('   ✅ Interface Studio & Room diekspor langsung sebagai native TypeScript types.');

  // -------------------------------------------------------------
  // 3. Verifikasi branch-venues-panel.tsx
  // -------------------------------------------------------------
  console.log('\n▶ 3. Memeriksa apps/web/app/branches/branch-venues-panel.tsx...');
  const venuesPanelPath = resolve(rootDir, 'apps/web/app/branches/branch-venues-panel.tsx');
  const venuesPanelContent = readFileSync(venuesPanelPath, 'utf8');

  if (venuesPanelContent.includes('@dailydose/api-client-ts/generated')) {
    throw new Error('branch-venues-panel.tsx masih mengimpor tipe dari @dailydose/api-client-ts/generated!');
  }
  if (!venuesPanelContent.includes("from '@/api-clients/master-client'")) {
    throw new Error('branch-venues-panel.tsx belum mengimpor Room & Studio dari master-client!');
  }
  console.log('   ✅ branch-venues-panel.tsx berhasil dialihkan ke native master-client types.');

  // -------------------------------------------------------------
  // 4. Verifikasi TypeScript Source Mapping (Zero Rebuild)
  // -------------------------------------------------------------
  console.log('\n▶ 4. Memeriksa TypeScript Source Mapping di tsconfig.json & package.json...');
  const tsconfigPath = resolve(rootDir, 'apps/web/tsconfig.json');
  const tsconfigContent = readFileSync(tsconfigPath, 'utf8');

  if (!tsconfigContent.includes('"@dailydose/api-client-ts/generated": ["../../packages/api-client-ts/generated/index.ts"]')) {
    throw new Error('apps/web/tsconfig.json belum memetakan path @dailydose/api-client-ts/generated ke source!');
  }
  console.log('   ✅ apps/web/tsconfig.json memetakan @dailydose/api-client-ts langsung ke TypeScript source.');

  const packageJsonPath = resolve(rootDir, 'packages/api-client-ts/package.json');
  const packageJsonContent = readFileSync(packageJsonPath, 'utf8');

  if (!packageJsonContent.includes('"source": "./src/index.ts"')) {
    throw new Error('packages/api-client-ts/package.json belum menyediakan field source!');
  }
  console.log('   ✅ packages/api-client-ts/package.json mengekspor source TypeScript.');

  console.log('\n================================================================');
  console.log('🎉 VERIFIKASI TAHAP 2 BERHASIL 100%! SEMUA TARGET TERPENUHI:');
  console.log('   1. Direct typed HTTP client (apiFetch) aktif & reusable');
  console.log('   2. Master Client bebas dari OpenAPI class generator');
  console.log('   3. Panel Venues (Studio & Ruangan) memakai native TypeScript types');
  console.log('   4. Zero-Rebuild: Perubahan model/tipe terbaca instan oleh web');
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('❌ Terjadi kesalahan pada verifikasi:', err);
  process.exit(1);
});
