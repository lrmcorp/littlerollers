import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { MasterAccessService } from '../../apps/api/src/master/master-access.service';
import { MasterCatalogService } from '../../apps/api/src/master/master-catalog.service';
import { PublicProfileAdminService } from '../../apps/api/src/master/public-profile-admin.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';

async function main() {
  console.log('🧪 Memulai Verifikasi Otomatis Tahap 3: Perampingan Controller & Service Backend (Clean CRUD)...\n');
  const rootDir = resolve(__dirname, '../..');

  // -------------------------------------------------------------
  // 1. Verifikasi Reduksi Kode & Penghapusan Dead Aliases
  // -------------------------------------------------------------
  console.log('▶ 1. Memeriksa Struktur File & Eliminasi Boilerplate...');
  const catalogPath = resolve(rootDir, 'apps/api/src/master/master-catalog.service.ts');
  const catalogContent = readFileSync(catalogPath, 'utf8');

  // Cek bahwa alias bahasa indonesia yang redundant sudah dihapus
  const deadAliases = ['daftarCabang', 'detailCabang', 'buatStudio', 'perbaruiStudio', 'daftarRuangan', 'buatRuangan', 'perbaruiRuangan', 'daftarJenisKelas', 'buatJenisKelas', 'perbaruiJenisKelas'];
  for (const alias of deadAliases) {
    if (catalogContent.includes(`async ${alias}(`)) {
      throw new Error(`Dead alias '${alias}' masih ditemukan di master-catalog.service.ts!`);
    }
  }
  console.log('   ✅ 10 dead Indonesian aliases berhasil dieliminasi.');

  // Cek helper executeMutation
  if (!catalogContent.includes('private async executeMutation<T>')) {
    throw new Error('Helper executeMutation tidak ditemukan di MasterCatalogService!');
  }
  console.log('   ✅ Reusable executeMutation helper terpasang (mengurangi duplikasi idempotency).');

  // Cek perampingan PublicProfileAdminService
  const profileServicePath = resolve(rootDir, 'apps/api/src/master/public-profile-admin.service.ts');
  const profileServiceContent = readFileSync(profileServicePath, 'utf8');
  const profileLines = profileServiceContent.split('\n').length;
  if (profileLines > 50) {
    throw new Error(`PublicProfileAdminService terlalu panjang (${profileLines} baris), seharusnya facade ramping < 50 baris.`);
  }
  console.log(`   ✅ PublicProfileAdminService ramping sebagai delegating facade (${profileLines} baris).`);

  // Cek perampingan MasterController
  const controllerPath = resolve(rootDir, 'apps/api/src/master/master.controller.ts');
  const controllerContent = readFileSync(controllerPath, 'utf8');
  if (controllerContent.includes('this.publicProfiles.list')) {
    throw new Error('MasterController masih memanggil this.publicProfiles!');
  }
  if (!controllerContent.includes('this.catalog.listPublicProfiles')) {
    throw new Error('MasterController belum mendelegasikan listPublicProfiles ke this.catalog!');
  }
  console.log('   ✅ MasterController berhasil didelegasikan langsung ke MasterCatalogService.');

  // -------------------------------------------------------------
  // 2. Pengujian Fungsional Langsung Terhadap Database & Service
  // -------------------------------------------------------------
  console.log('\n▶ 2. Menjalankan Uji Fungsional MasterCatalogService & DB...');
  const prisma = new PrismaClient();
  await prisma.$connect();

  const { PolicyService } = await import('../../apps/api/src/identity/policy.service');
  const policy = new PolicyService();
  const access = new MasterAccessService(policy);
  const catalog = new MasterCatalogService(prisma as never, access);
  const publicProfiles = new PublicProfileAdminService(catalog);

  const testPrincipal: SessionPrincipal = {
    userId: 'test-admin-user',
    role: 'OWNER',
    branchId: null,
    capabilities: ['master:read', 'master:manage', 'branch:all'],
    branchIds: [],
    impersonatorUserId: null,
    sessionId: 'test-session',
    tokenJti: 'test-jti',
    issuedAtEpochSeconds: Math.floor(Date.now() / 1000),
    expiresAtEpochSeconds: Math.floor(Date.now() / 1000) + 3600,
  } as unknown as SessionPrincipal;

  try {
    // 2.1 Test listBranches & branchDetail
    console.log('   • Menguji listBranches & branchDetail...');
    const result = await catalog.listBranches(testPrincipal);
    if (!result || !result.items || result.items.length === 0) {
      throw new Error('Tidak ada cabang yang ditemukan di database!');
    }
    const targetBranch = result.items[0];
    const detail = await catalog.branchDetail(testPrincipal, targetBranch.id);
    if (detail.id !== targetBranch.id) {
      throw new Error('branchDetail mengembalikan ID yang tidak sesuai!');
    }
    console.log(`     ✓ Cabang terverifikasi: ${detail.name} (${detail.code})`);

    // 2.2 Test listPublicProfiles & facade
    console.log('   • Menguji listPublicProfiles (Catalog & PublicProfileAdminService facade)...');
    const catalogProfiles = await catalog.listPublicProfiles(testPrincipal, targetBranch.id);
    const facadeProfiles = await publicProfiles.list(testPrincipal, targetBranch.id);
    if (!catalogProfiles.branch.publicProfile || !facadeProfiles.branch.publicProfile) {
      throw new Error('Public profile tidak ter-render dengan benar!');
    }
    console.log('     ✓ Public profile retrieved successfully via Catalog and Facade.');

    // 2.3 Test updatePublicProfile
    console.log('   • Menguji updatePublicProfile...');
    const updateRes = await catalog.updatePublicProfile(
      testPrincipal,
      'branch',
      targetBranch.id,
      {
        heroImageKey: targetBranch.heroImageKey ?? 'branch-hero-default',
        reason: 'Verifikasi Phase 3 CRUD Clean',
      },
      'corr-phase-3-test',
    );
    if (!updateRes.updated) {
      throw new Error('updatePublicProfile gagal memperbarui!');
    }
    console.log('     ✓ updatePublicProfile berhasil dijalankan.');

    // 2.4 Test listStudios
    console.log('   • Menguji listStudios...');
    const studiosRes = await catalog.listStudios(testPrincipal, targetBranch.id);
    const studios = studiosRes.items;
    console.log(`     ✓ Ditemukan ${studios.length} studio untuk cabang ${targetBranch.name}.`);

    if (studios.length > 0) {
      const studio = studios[0];
      const roomsBeforeRes = await catalog.listRooms(testPrincipal, studio.id);
      const roomsBefore = roomsBeforeRes.items;
      console.log(`     ✓ Ditemukan ${roomsBefore.length} ruangan untuk studio ${studio.name}.`);

      // 2.5 Test createRoom via executeMutation
      console.log('   • Menguji createRoom via Clean CRUD & executeMutation...');
      const testRoomCode = `TEST_RM_${Date.now().toString().slice(-4)}`;
      const newRoom = await catalog.createRoom(
        testPrincipal,
        studio.id,
        {
          code: testRoomCode,
          name: 'Ruang Uji Tahap 3',
          capacity: 4,
        },
        'corr-room-create-test',
      );
      if (!newRoom || newRoom.code !== testRoomCode) {
        throw new Error('Gagal membuat ruangan uji!');
      }
      console.log(`     ✓ Ruangan baru berhasil dibuat: ${newRoom.name} (${newRoom.code}).`);

      // 2.6 Test updateRoom
      console.log('   • Menguji updateRoom...');
      const updatedRoom = await catalog.updateRoom(
        testPrincipal,
        newRoom.id,
        {
          name: 'Ruang Uji Tahap 3 (Updated)',
          capacity: 6,
          active: true,
        },
        'corr-room-update-test',
      );
      if (updatedRoom.name !== 'Ruang Uji Tahap 3 (Updated)' || updatedRoom.capacityBed !== 6) {
        throw new Error('Gagal memperbarui data ruangan uji!');
      }
      console.log(`     ✓ Ruangan berhasil diperbarui: ${updatedRoom.name}, kapasitas: ${updatedRoom.capacityBed}.`);

      // Bersihkan data ruangan uji
      await prisma.ruangan.delete({ where: { id: newRoom.id } });
      console.log('     ✓ Data ruangan uji berhasil dibersihkan.');
    }

    // 2.7 Test listClassTypes
    console.log('   • Menguji listClassTypes...');
    const classTypesRes = await catalog.listClassTypes(testPrincipal, targetBranch.id);
    const classTypes = classTypesRes.items;
    console.log(`     ✓ Ditemukan ${classTypes.length} tipe kelas aktif.`);

    console.log('\n=============================================================');
    console.log('🎉 SELURUH VERIFIKASI TAHAP 3 BERHASIL (100% PASS)!');
    console.log('=============================================================');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ VERIFIKASI TAHAP 3 GAGAL:', err);
  process.exit(1);
});
