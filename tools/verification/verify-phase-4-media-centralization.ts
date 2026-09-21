import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PublicMediaService } from '../../apps/api/src/public-content/public-media.service';
import { MasterCatalogService } from '../../apps/api/src/master/master-catalog.service';
import { MasterAccessService } from '../../apps/api/src/master/master-access.service';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import { resolveImageUrl } from '../../apps/web/app/lib/media';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';

async function main() {
  console.log('🧪 Memulai Verifikasi Otomatis Tahap 4: Sentralisasi Pengelolaan Media & MinIO Storage...\n');
  const rootDir = resolve(__dirname, '../..');

  // -------------------------------------------------------------
  // 1. Verifikasi Kode & Eliminasi Katalog Statis
  // -------------------------------------------------------------
  console.log('▶ 1. Memeriksa Integritas Kode & Eliminasi Hardcoded Catalog...');

  // 1.1 Cek master-catalog.service.ts bebas dari import PUBLIC_ASSET_KEYS
  const catalogPath = resolve(rootDir, 'apps/api/src/master/master-catalog.service.ts');
  const catalogContent = readFileSync(catalogPath, 'utf8');
  if (catalogContent.includes('PUBLIC_ASSET_KEYS')) {
    throw new Error('master-catalog.service.ts masih mengimpor atau menggunakan PUBLIC_ASSET_KEYS!');
  }
  if (!catalogContent.includes('dynamicKeys')) {
    throw new Error('master-catalog.service.ts belum mengimplementasikan dynamicKeys dari database!');
  }
  console.log('   ✅ master-catalog.service.ts 100% bebas dari PUBLIC_ASSET_KEYS statis.');
  console.log('   ✅ Dynamic asset keys discovery dari database aktif.');

  // 1.2 Cek public-asset-catalog.ts telah di-deprecate
  const assetCatalogPath = resolve(rootDir, 'apps/api/src/master/public-asset-catalog.ts');
  const assetCatalogContent = readFileSync(assetCatalogPath, 'utf8');
  if (!assetCatalogContent.includes('@deprecated')) {
    throw new Error('public-asset-catalog.ts belum ditandai @deprecated!');
  }
  console.log('   ✅ public-asset-catalog.ts terverifikasi @deprecated.');

  // 1.3 Cek keberadaan global media helper (apps/web/app/lib/media.ts)
  const mediaHelperPath = resolve(rootDir, 'apps/web/app/lib/media.ts');
  const mediaHelperContent = readFileSync(mediaHelperPath, 'utf8');
  if (!mediaHelperContent.includes('export async function uploadImage')) {
    throw new Error('uploadImage helper tidak ditemukan di apps/web/app/lib/media.ts!');
  }
  if (!mediaHelperContent.includes('export const resolveImageUrl')) {
    throw new Error('resolveImageUrl helper tidak ditemukan di apps/web/app/lib/media.ts!');
  }
  console.log('   ✅ Global media helpers (uploadImage & resolveImageUrl) aktif dan terverifikasi.');

  // 1.4 Cek ImageUploadField menggunakan uploadImage
  const imageUploadPath = resolve(rootDir, 'apps/web/app/components/forms/image-upload-field.tsx');
  const imageUploadContent = readFileSync(imageUploadPath, 'utf8');
  if (!imageUploadContent.includes('uploadImage(file)')) {
    throw new Error('ImageUploadField belum di-refactor menggunakan uploadImage helper!');
  }
  console.log('   ✅ ImageUploadField berhasil di-refactor menggunakan global uploadImage.');

  // 1.5 Cek MultiImageGalleryField & integrasi di branch-public-profile-drawer.tsx
  const formsPath = resolve(rootDir, 'apps/web/app/components/forms.tsx');
  const formsContent = readFileSync(formsPath, 'utf8');
  if (!formsContent.includes('MultiImageGalleryField')) {
    throw new Error('MultiImageGalleryField tidak diekspor di apps/web/app/components/forms.tsx!');
  }

  const drawerPath = resolve(rootDir, 'apps/web/app/branches/branch-public-profile-drawer.tsx');
  const drawerContent = readFileSync(drawerPath, 'utf8');
  if (drawerContent.includes('textarea name="galleryImageKeys"')) {
    throw new Error('branch-public-profile-drawer.tsx masih menggunakan textarea untuk galleryImageKeys!');
  }
  if (!drawerContent.includes('<MultiImageGalleryField')) {
    throw new Error('branch-public-profile-drawer.tsx belum menggunakan MultiImageGalleryField!');
  }
  console.log('   ✅ MultiImageGalleryField visual component terpasang di branch-public-profile-drawer.tsx.');

  // 1.6 Cek endpoint list media di backend controller
  const mediaControllerPath = resolve(rootDir, 'apps/api/src/public-content/public-media.controller.ts');
  const mediaControllerContent = readFileSync(mediaControllerPath, 'utf8');
  if (!mediaControllerContent.includes('@Get(\'public-content-management/media\')')) {
    throw new Error('Endpoint GET public-content-management/media tidak ditemukan di PublicMediaController!');
  }
  console.log('   ✅ Endpoint GET /api/v1/public-content-management/media terpasang.');

  // -------------------------------------------------------------
  // 2. Pengujian Fungsional Live Media Service & Database
  // -------------------------------------------------------------
  console.log('\n▶ 2. Menjalankan Uji Fungsional Live Media Service & MinIO/Local Storage...');
  const mediaService = new PublicMediaService();

  // Test gambar base64 1x1 PNG transparan
  const sample1x1PngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  console.log('   • Menguji upload gambar via PublicMediaService.savePublicImage()...');
  const uploadResult = await mediaService.savePublicImage({
    filename: 'test-phase-4-sample.png',
    mimeType: 'image/png',
    contentBase64: sample1x1PngBase64,
  });

  if (!uploadResult.key || !uploadResult.url) {
    throw new Error('savePublicImage tidak mengembalikan key atau url yang valid!');
  }
  console.log(`     ✓ Berhasil mengunggah media: key=${uploadResult.key}, size=${uploadResult.sizeBytes} bytes`);

  // Test dynamic listing
  console.log('   • Menguji pengambilan daftar media dinamis via PublicMediaService.listMedia()...');
  const mediaList = await mediaService.listMedia(100);
  if (!mediaList.includes(uploadResult.key)) {
    throw new Error(`Media key ${uploadResult.key} tidak ditemukan pada hasil listMedia()!`);
  }
  console.log(`     ✓ Ditemukan ${mediaList.length} media terdaftar, termasuk file uji coba yang baru.`);

  // Test getPublicImage
  console.log('   • Menguji pembacaan gambar via PublicMediaService.getPublicImage()...');
  const readResult = await mediaService.getPublicImage(uploadResult.key);
  if (!readResult.buffer || readResult.buffer.length === 0) {
    throw new Error('Buffer gambar kosong!');
  }
  console.log(`     ✓ Buffer gambar berhasil dibaca (${readResult.buffer.length} bytes, ${readResult.mimeType}).`);

  // Test resolveImageUrl
  console.log('   • Menguji resolveImageUrl helper...');
  const resolvedUrl = resolveImageUrl(uploadResult.key);
  if (!resolvedUrl.includes(uploadResult.key)) {
    throw new Error(`resolveImageUrl gagal menyelesaikan URL untuk key ${uploadResult.key}`);
  }
  console.log(`     ✓ URL ter-resolve dengan benar: ${resolvedUrl}`);

  // Test cleanup
  const localFilePath = resolve(
    process.env.PUBLIC_UPLOAD_ROOT?.trim() || resolve(process.cwd(), '.local-data', 'public-uploads'),
    uploadResult.key,
  );
  if (existsSync(localFilePath)) {
    unlinkSync(localFilePath);
    console.log('     ✓ File media uji coba lokal berhasil dibersihkan.');
  }

  // -------------------------------------------------------------
  // 3. Pengujian Fungsional Dynamic Asset Discovery di Catalog
  // -------------------------------------------------------------
  console.log('\n▶ 3. Menguji Dynamic Asset Discovery di MasterCatalogService...');
  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    const policy = new PolicyService();
    const access = new MasterAccessService(policy);
    const catalog = new MasterCatalogService(prisma as never, access);

    const testPrincipal: SessionPrincipal = {
      userId: 'test-admin',
      role: 'OWNER',
      branchId: null,
      capabilities: ['master:read', 'master:manage', 'branch:all'],
      branchIds: [],
      impersonatorUserId: null,
      sessionId: 'test-sess',
      tokenJti: 'test-jti',
      issuedAtEpochSeconds: Math.floor(Date.now() / 1000),
      expiresAtEpochSeconds: Math.floor(Date.now() / 1000) + 3600,
    } as unknown as SessionPrincipal;

    const branchesRes = await catalog.listBranches(testPrincipal);
    const targetBranch = branchesRes.items[0];

    const profilesRes = await catalog.listPublicProfiles(testPrincipal, targetBranch.id);
    const dynamicAssetKeys = profilesRes.assetKeys;

    console.log(`   ✓ Ditemukan ${dynamicAssetKeys.length} dynamic asset keys dari database.`);
    if (dynamicAssetKeys.length > 0) {
      console.log(`   ✓ Sampel asset keys yang terdeteksi: ${dynamicAssetKeys.slice(0, 3).join(', ')}...`);
    }

    console.log('\n================================================================');
    console.log('🎉 SELURUH VERIFIKASI TAHAP 4 BERHASIL (100% PASS)!');
    console.log('================================================================');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ VERIFIKASI TAHAP 4 GAGAL:', err);
  process.exit(1);
});
