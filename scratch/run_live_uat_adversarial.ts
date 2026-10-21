import { PrismaClient, ClassSlotStatus } from '../apps/api/node_modules/@prisma/client';
import { AttendanceService } from '../apps/api/src/attendance/kehadiran.service';
import { PolicyService } from '../apps/api/src/identity/policy.service';
import { calculateSlotFee } from '../apps/api/src/packages/instructor-fee-calculator';

const prisma = new PrismaClient();
const policy = new PolicyService();
const attendanceService = new AttendanceService(prisma as any, policy, {} as any);

async function runLiveUat() {
  console.log('🚀 Memulai UAT & Non-Happy Path Live Database Verification...\n');
  const results: Array<{ test: string; status: 'PASSED' | 'FAILED'; detail?: string }> = [];

  // 1. Ambil atau inisialisasi Cabang dengan GPS
  const branch = await prisma.cabang.findFirst({
    where: { active: true },
  });

  if (!branch) {
    throw new Error('Tidak ada cabang aktif di database.');
  }

  // Update cabang agar memiliki koordinat GPS uji (Green Garden)
  const testLat = -6.1685;
  const testLng = 106.7628;
  const testRadius = 150; // 150 meter

  await prisma.cabang.update({
    where: { id: branch.id },
    data: {
      latitude: testLat,
      longitude: testLng,
      geofenceRadiusMeters: testRadius,
    },
  });
  console.log(`✅ [SETUP] Cabang "${branch.name}" diset koordinat: (${testLat}, ${testLng}), Radius: ${testRadius}m`);

  // 2. Ambil Instruktur & Jenis Kelas
  const instructor = await prisma.user.findFirst({
    where: { role: 'INSTRUCTOR' },
  });

  const jenisKelas = await prisma.jenisKelas.findFirst({
    where: { active: true },
  });

  const studio = await prisma.studio.findFirst({
    where: { branchId: branch.id },
  });

  if (!instructor || !jenisKelas || !studio) {
    throw new Error('Data master (instruktur/jenis kelas/studio) belum lengkap di database.');
  }

  const principal = {
    sessionId: 'uat-live-session',
    userId: instructor.id,
    roles: [{ role: 'INSTRUCTOR' as const, branchId: branch.id }],
    capabilities: ['attendance:self', 'class-slot:read'],
    branchIds: [branch.id],
  };

  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ['SUPER_OWNER', 'ADMIN', 'MANAGER'] } },
  });
  if (!adminUser) throw new Error('Tidak ada admin user di database.');

  const adminPrincipal = {
    sessionId: 'uat-admin-session',
    userId: adminUser.id,
    roles: [{ role: adminUser.role as any, branchId: null }],
    capabilities: ['attendance:manage', 'class-slot:manage', 'branch:all'],
    branchIds: [branch.id],
  };

  // Buat slot kelas uji dengan Modal Manual per Sesi
  const manualFeeNominal = 275_000;
  const now = new Date();
  const startAt = new Date(now.getTime() + 10 * 60_000); // Mulai 10 menit lagi (jendela H-30m sudah buka)
  const endAt = new Date(now.getTime() + 70 * 60_000); // Selesai 70 menit lagi

  const testSlot = await prisma.slotKelas.create({
    data: {
      branchId: branch.id,
      studioId: studio.id,
      classTypeId: jenisKelas.id,
      instructorId: instructor.id,
      startAt,
      endAt,
      status: ClassSlotStatus.CONFIRMED,
      capacity: 6,
      minQuota: 1,
      instructorFeeRp: manualFeeNominal,
      isManualFee: true,
    },
  });

  console.log(`✅ [SETUP] Slot Kelas Uji dibuat: ID ${testSlot.id}, Fee Manual: Rp ${manualFeeNominal.toLocaleString('id-ID')}`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Penerbitan QR Presensi oleh Admin/Staf Studio
    // -------------------------------------------------------------------------
    const issued = await attendanceService.issueInstructor(
      adminPrincipal,
      testSlot.id,
      'uat-key-issue-1',
      'corr-issue-1',
      now,
    );
    results.push({
      test: 'Issue QR Token Presensi Instruktur untuk Slot Kelas',
      status: issued && issued.qrPayload ? 'PASSED' : 'FAILED',
      detail: `Token: ${issued.token.slice(0, 8)}... (Payload: ${issued.qrPayload.slice(0, 25)}...)`,
    });

    const rawQrToken = issued.qrPayload;

    // -------------------------------------------------------------------------
    // TEST 2 (Non-Happy Path): Scan Tanpa Koordinat GPS pada Cabang Ber-GPS
    // -------------------------------------------------------------------------
    try {
      await attendanceService.consumeInstructor(
        principal,
        { token: rawQrToken }, // Tanpa latitude & longitude
        'uat-key-scan-1',
        'corr-scan-1',
        now,
      );
      results.push({
        test: '[Non-Happy Path] Penolakan Scan Tanpa GPS (GEOLOCATION_REQUIRED)',
        status: 'FAILED',
        detail: 'Harusnya ditolak, tetapi berhasil diproses',
      });
    } catch (err: any) {
      const isExpected = err.code === 'GEOLOCATION_REQUIRED';
      results.push({
        test: '[Non-Happy Path] Penolakan Scan Tanpa GPS (GEOLOCATION_REQUIRED)',
        status: isExpected ? 'PASSED' : 'FAILED',
        detail: `Error code: ${err.code}`,
      });
    }

    // -------------------------------------------------------------------------
    // TEST 3 (Non-Happy Path): Scan Di Luar Radius Geofence Cabang (~800m)
    // -------------------------------------------------------------------------
    try {
      await attendanceService.consumeInstructor(
        principal,
        {
          token: rawQrToken,
          latitude: testLat + 0.007, // ~780 meter dari studio (batas 150m)
          longitude: testLng,
        },
        'uat-key-scan-2',
        'corr-scan-2',
        now,
      );
      results.push({
        test: '[Non-Happy Path] Penolakan Scan di Luar Radius Geofence (OUT_OF_GEOFENCE)',
        status: 'FAILED',
        detail: 'Harusnya ditolak OUT_OF_GEOFENCE, tetapi berhasil diproses',
      });
    } catch (err: any) {
      const isExpected = err.code === 'OUT_OF_GEOFENCE';
      results.push({
        test: '[Non-Happy Path] Penolakan Scan di Luar Radius Geofence (OUT_OF_GEOFENCE)',
        status: isExpected ? 'PASSED' : 'FAILED',
        detail: `Error code: ${err.code}`,
      });
    }

    // -------------------------------------------------------------------------
    // TEST 4 (Happy Path): Scan di Dalam Radius Geofence Cabang (~35m)
    // -------------------------------------------------------------------------
    const validScanResult = await attendanceService.consumeInstructor(
      principal,
      {
        token: rawQrToken,
        latitude: testLat + 0.0003, // ~33 meter dari studio (di dalam batas 150m)
        longitude: testLng,
      },
      'uat-key-scan-3',
      'corr-scan-3',
      now,
    );

    const checkInRecord = await prisma.kehadiranInstruktur.findUnique({
      where: { classSlotId: testSlot.id },
    });

    results.push({
      test: '[Happy Path] Presensi Instruktur Sukses dalam Radius Geofence',
      status:
        validScanResult.status === 200 &&
        checkInRecord?.isWithinGeofence === true &&
        (checkInRecord?.distanceMeters ?? 999) <= testRadius
          ? 'PASSED'
          : 'FAILED',
      detail: `Tercatat distance: ${checkInRecord?.distanceMeters}m (Radius: ${testRadius}m, withinGeofence: ${checkInRecord?.isWithinGeofence})`,
    });

    // -------------------------------------------------------------------------
    // TEST 5 (Non-Happy Path): Token yang Sudah Dipakai Ditolak Scan Ulang
    // -------------------------------------------------------------------------
    try {
      await attendanceService.consumeInstructor(
        principal,
        {
          token: rawQrToken,
          latitude: testLat + 0.0003,
          longitude: testLng,
        },
        'uat-key-scan-4',
        'corr-scan-4',
        now,
      );
      results.push({
        test: '[Non-Happy Path] Penolakan Token yang Sudah Dipakai (TOKEN_ALREADY_USED)',
        status: 'FAILED',
        detail: 'Token terpakai tidak ditolak',
      });
    } catch (err: any) {
      const isExpected = err.code === 'TOKEN_ALREADY_USED';
      results.push({
        test: '[Non-Happy Path] Penolakan Token yang Sudah Dipakai (TOKEN_ALREADY_USED)',
        status: isExpected ? 'PASSED' : 'FAILED',
        detail: `Error code: ${err.code}`,
      });
    }

    // -------------------------------------------------------------------------
    // TEST 6: Verifikasi Modal / Biaya Instruktur Manual Flat per Sesi
    // -------------------------------------------------------------------------
    const feeResult = calculateSlotFee([], {
      instructorId: instructor.id,
      branchId: branch.id,
      classTypeId: jenisKelas.id,
      startAt: testSlot.startAt,
      endAt: testSlot.endAt,
      isManualFee: testSlot.isManualFee,
      instructorFeeRp: testSlot.instructorFeeRp,
    });

    results.push({
      test: 'Penentuan Modal/Honor Manual per Sesi Kelas (Override Tarif Per Jam)',
      status: feeResult.feeRp === manualFeeNominal && feeResult.isManual === true ? 'PASSED' : 'FAILED',
      detail: `Nominal terhitung: Rp ${feeResult.feeRp.toLocaleString('id-ID')} (Manual: ${feeResult.isManual})`,
    });

  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP: Bersihkan data uji agar database tetap bersih
    // -------------------------------------------------------------------------
    await prisma.kehadiranInstruktur.deleteMany({ where: { classSlotId: testSlot.id } });
    await prisma.instructorCheckInToken.deleteMany({ where: { classSlotId: testSlot.id } });
    await prisma.slotKelas.delete({ where: { id: testSlot.id } });
    console.log('\n🧹 [CLEANUP] Data uji (Kehadiran, Token, Slot) berhasil dibersihkan dari database.\n');
  }

  // Tampilkan tabel rekap hasil UAT
  console.log('='.repeat(80));
  console.log('HASIL VERIFIKASI UAT & NON-HAPPY PATH:');
  console.log('='.repeat(80));
  results.forEach((r, idx) => {
    const icon = r.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} [${idx + 1}] ${r.test}`);
    console.log(`    Status: ${r.status} | Detail: ${r.detail}`);
  });
  console.log('='.repeat(80));

  const allPassed = results.every((r) => r.status === 'PASSED');
  console.log(allPassed ? '\n🎉 SEMUA UJI UAT LIVE & NON-HAPPY PATH LOLOS 100%!' : '\n⚠️ ADA UJI YANG GAGAL.');
  await prisma.$disconnect();
}

runLiveUat().catch((e) => {
  console.error('Fatal error during UAT:', e);
  process.exit(1);
});
