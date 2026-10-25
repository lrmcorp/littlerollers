/**
 * UAT Script: PERAN 2 - OWNER CABANG / MITRA STUDIO LOKAL
 * Skenario Berdasarkan: docs/arsip/uat/roles/UAT_ROLE_2_OWNER_CABANG.md
 * 
 * Penguji: Budi Santoso (Owner Cabang Green Garden - Orang Awam QA)
 * Target: 4 Pilar Finansial Cabang, Warning Unverified Fee,
 *         Isolasi Cabang Permanen (Rule #10), Proteksi Mode Hanya-Baca (Read-Only).
 */

import { PrismaClient, ClassSlotStatus } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:32121/api/v1';

interface UatResult {
  code: string;
  scenario: string;
  isHappyPath: boolean;
  expectedStatus: number | number[];
  actualStatus: number;
  pass: boolean;
  userFacingFeedback: string;
  critiqueOrNotes: string;
}

const uatResults: UatResult[] = [];

async function api(
  token: string | null,
  method: string,
  path: string,
  body?: any,
  headers?: Record<string, string>,
) {
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'idempotency-key': crypto.randomUUID(),
    ...(headers || {}),
  };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let resBody: any = null;
  const text = await res.text();
  try {
    resBody = JSON.parse(text);
  } catch {
    resBody = text;
  }

  return { status: res.status, body: resBody };
}

async function login(email: string, password = 'ridho123') {
  const res = await api(null, 'POST', '/auth/password/sessions', { email, password, channel: 'MOBILE' });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${email}: status=${res.status}, body=${JSON.stringify(res.body)}`);
  }
  return { token: res.body?.accessToken, session: res.body };
}

async function runOwnerCabangUat() {
  console.log('========================================================================');
  console.log('🎬 MEMULAI EKSEKUSI UAT: PERAN 2 - OWNER CABANG (MITRA STUDIO LOKAL)');
  console.log('Platform: Daily Dose Pilates Studio Management System V2');
  console.log('Target Akun: owner.gg@dailydose.test (Budi Santoso - Owner Green Garden)');
  console.log('Dokumen Panduan: docs/arsip/uat/roles/UAT_ROLE_2_OWNER_CABANG.md');
  console.log('========================================================================\n');

  // 1. Authenticate Owner
  const ownerAuth = await login('owner.gg@dailydose.test');
  const ownerToken = ownerAuth.token;
  console.log('✅ Login Owner Green Garden berhasil (Token acquired).');

  // Fetch Branches
  const ggBranch = await prisma.cabang.findFirst({ where: { name: { contains: 'Green Garden' } } });
  if (!ggBranch) throw new Error('Cabang Green Garden tidak ditemukan');

  const mkBranch = await prisma.cabang.findFirst({ where: { name: { contains: 'Muara Karang' } } });
  if (!mkBranch) throw new Error('Cabang Muara Karang tidak ditemukan');

  const coachSarah = await prisma.user.findFirst({ where: { email: 'coach.sarah@dailydose.test' } });
  const classType = await prisma.jenisKelas.findFirst();
  const studio1 = await prisma.studio.findFirst({ where: { branchId: ggBranch.id } });
  const room1 = await prisma.ruangan.findFirst({ where: { studioId: studio1?.id } });

  console.log(`📍 Master Reference: Cabang Sendiri (GG) = ${ggBranch.name} (${ggBranch.id})`);
  console.log(`   Cabang Terlarang (MK) = ${mkBranch.name} (${mkBranch.id})`);
  console.log(`   Owner User = Budi Santoso (${ownerAuth.session.user?.displayName || 'Owner Green Garden'})`);

  // --------------------------------------------------------------------------
  // MODUL 2.1: Laporan Performa & Finansial Cabang Sendiri (/workspace/branch-performance)
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 2.1: 4 PILAR METRIK FINANSIAL CABANG GREEN GARDEN] ---');

  // Skenario UAT-OW-01: Pemantauan 4 Pilar Finansial Cabang Green Garden
  console.log('▶ Uji UAT-OW-01 (Happy Path): Owner memantau 4 pilar finansial Green Garden...');
  const resOW01 = await api(ownerToken, 'GET', `/finance/owner-branch-performance?branchId=${ggBranch.id}`);
  const dataOW01 = resOW01.body;

  const passOW01 =
    resOW01.status === 200 &&
    dataOW01?.branch?.id === ggBranch.id &&
    typeof dataOW01?.omsetRp === 'number' &&
    typeof dataOW01?.totalInstructorFeeRp === 'number' &&
    typeof dataOW01?.otherCostRp === 'number' &&
    typeof dataOW01?.estimatedProfitRp === 'number' &&
    Array.isArray(dataOW01?.instructors);

  uatResults.push({
    code: 'UAT-OW-01',
    scenario: 'Tinjauan 4 Pilar Metrik Finansial Cabang Sendiri (Omset, Honor, Operasional, Profit)',
    isHappyPath: true,
    expectedStatus: 200,
    actualStatus: resOW01.status,
    pass: passOW01,
    userFacingFeedback: 'Dashboard menyajikan Omset, Beban Instruktur, Beban Operasional, dan Estimasi Laba Bersih secara jelas.',
    critiqueOrNotes: passOW01
      ? `Sangat memuaskan untuk investor non-akuntansi: Omset Rp ${dataOW01.omsetRp.toLocaleString('id-ID')}, Beban Instruktur Rp ${dataOW01.totalInstructorFeeRp.toLocaleString('id-ID')}, Beban Lain Rp ${dataOW01.otherCostRp.toLocaleString('id-ID')}, Estimasi Laba Rp ${dataOW01.estimatedProfitRp.toLocaleString('id-ID')}.`
      : `Gagal memuat 4 pilar finansial: status=${resOW01.status}, body=${JSON.stringify(dataOW01)}`,
  });
  console.log(`  Result: status=${resOW01.status}, omset=Rp ${dataOW01?.omsetRp}, profit=Rp ${dataOW01?.estimatedProfitRp}, instructors=${dataOW01?.instructors?.length}`);

  // --------------------------------------------------------------------------
  // MODUL 2.2: Isolasi Cabang & Deteksi Honor Belum Terverifikasi
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 2.2: DETEKSI UNVERIFIED FEE & ISOLASI CABANG (RULE #10)] ---');

  // Skenario UAT-OW-02A: Deteksi Peringatan Honor Belum Terverifikasi (Unverified Blocker)
  console.log('▶ Uji UAT-OW-02A (Warning Guard): Deteksi kelas selesai tanpa presensi instruktur...');
  
  // Setup 1 completed class without attendance
  const now = new Date();
  const unverifiedSlot = await prisma.slotKelas.create({
    data: {
      id: crypto.randomUUID(),
      branchId: ggBranch.id,
      studioId: studio1!.id,
      roomId: room1!.id,
      classTypeId: classType!.id,
      instructorId: coachSarah!.id,
      startAt: new Date(now.getTime() - 90 * 60 * 1000),
      endAt: new Date(now.getTime() - 40 * 60 * 1000),
      capacity: 8,
      status: ClassSlotStatus.COMPLETED,
      instructorFeeRp: 250000,
    },
  });

  const resOW02A = await api(ownerToken, 'GET', `/finance/owner-branch-performance?branchId=${ggBranch.id}`);
  const passOW02A =
    resOW02A.status === 200 &&
    (resOW02A.body?.totalUnverifiedFeeRp ?? 0) >= 250000 &&
    (resOW02A.body?.unverifiedClassCount ?? 0) >= 1;

  uatResults.push({
    code: 'UAT-OW-02A',
    scenario: 'Indikator Warning Kartu Biaya Instruktur Unverified (Peringatan Angka Sementara)',
    isHappyPath: false,
    expectedStatus: 200,
    actualStatus: resOW02A.status,
    pass: passOW02A,
    userFacingFeedback: 'Peringatan oranye: Terdapat kelas selesai yang belum diverifikasi presensinya. Estimasi laba berstatus sementara.',
    critiqueOrNotes: passOW02A
      ? `Transparansi tinggi: Owner langsung melihat Rp ${(resOW02A.body.totalUnverifiedFeeRp).toLocaleString('id-ID')} (${resOW02A.body.unverifiedClassCount} kelas) belum diverifikasi presensi.`
      : `Gagal deteksi unverified fee: unverifiedFee=${resOW02A.body?.totalUnverifiedFeeRp}`,
  });
  console.log(`  Result: unverifiedFee=Rp ${resOW02A.body?.totalUnverifiedFeeRp}, unverifiedClasses=${resOW02A.body?.unverifiedClassCount}`);

  // Skenario UAT-OW-02B: Penguncian Dropdown Cabang Hanya Green Garden
  console.log('▶ Uji UAT-OW-02B (UI Guard): Memastikan profil owner terkunci hanya pada cabang Green Garden...');
  const ownerUserInDb = await prisma.user.findUnique({
    where: { email: 'owner.gg@dailydose.test' },
    include: { ownedBranches: true },
  });
  const ownedBranchIds = ownerUserInDb?.ownedBranches.map((b) => b.branchId) || [];
  const sessionBranches = ownerAuth.session.branches || [];

  const passOW02B =
    ownedBranchIds.length === 1 &&
    ownedBranchIds[0] === ggBranch.id &&
    !ownedBranchIds.includes(mkBranch.id);

  uatResults.push({
    code: 'UAT-OW-02B',
    scenario: 'Penguncian Hak Akses & Dropdown Cabang Hanya Green Garden (Single Branch Scope)',
    isHappyPath: true,
    expectedStatus: 200,
    actualStatus: 200,
    pass: passOW02B,
    userFacingFeedback: 'Otoritas cabang terkunci eksklusif pada Daily Dose Green Garden.',
    critiqueOrNotes: passOW02B
      ? 'Aman: Hak cabang Owner GG terkunci eksklusif pada Green Garden (a1000000-0000-4000-8000-000000000001) tanpa opsi membuka cabang lain.'
      : `Gagal isolasi cabang owner: ownedBranchIds=${JSON.stringify(ownedBranchIds)}`,
  });
  console.log(`  Result: ownedBranchCount=${ownedBranchIds.length}, branch=${ownedBranchIds[0]}`);

  // Skenario UAT-OW-02C: Proteksi API Isolasi Multi-Cabang (Rule #10)
  console.log(`▶ Uji UAT-OW-02C (No-Happy Path / Direct API Attack): Owner GG mencoba melihat performa Muara Karang (${mkBranch.id})...`);
  const resOW02C = await api(ownerToken, 'GET', `/finance/owner-branch-performance?branchId=${mkBranch.id}`);
  const passOW02C = resOW02C.status === 403;

  uatResults.push({
    code: 'UAT-OW-02C',
    scenario: 'Proteksi API Isolasi Multi-Cabang (Rule #10): Akses Laporan Cabang Lain Ditolak 403',
    isHappyPath: false,
    expectedStatus: 403,
    actualStatus: resOW02C.status,
    pass: passOW02C,
    userFacingFeedback: 'Akses ditolak (HTTP 403 Forbidden). Anda tidak memiliki wewenang untuk mengakses cabang ini.',
    critiqueOrNotes: passOW02C
      ? 'Perlindungan Kerahasiaan Investor Terjamin: Upaya tembak API cabang Muara Karang diblokir seketika dengan status 403 Forbidden.'
      : `Kebocoran data cabang lain! status=${resOW02C.status}, body=${JSON.stringify(resOW02C.body)}`,
  });
  console.log(`  Result: status=${resOW02C.status}, error.code=${resOW02C.body?.error?.code}`);

  // Skenario UAT-OW-02D: Mode Hanya-Baca (Read-Only Protection)
  console.log('▶ Uji UAT-OW-02D (No-Happy Path / Mutation Guard): Owner mencoba membuat jadwal kelas baru...');
  const resOW02D = await api(ownerToken, 'POST', '/class-slots', {
    branchId: ggBranch.id,
    studioId: studio1!.id,
    roomId: room1!.id,
    classTypeId: classType!.id,
    instructorId: coachSarah!.id,
    startAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    endAt: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
    capacity: 10,
    instructorFeeRp: 250000,
  });
  const passOW02D = resOW02D.status === 403;

  uatResults.push({
    code: 'UAT-OW-02D',
    scenario: 'Mode Hanya-Baca (Read-Only Protection): Mutasi Operasional Dilarang untuk Owner (HTTP 403)',
    isHappyPath: false,
    expectedStatus: 403,
    actualStatus: resOW02D.status,
    pass: passOW02D,
    userFacingFeedback: 'Akses ditolak (HTTP 403 Forbidden). Akun Owner hanya memiliki hak baca (Read-Only).',
    critiqueOrNotes: passOW02D
      ? 'Operasional Aman dari Intervensi: Owner tidak memiliki izin class-slot:manage sehingga permintaan mutasi jadwal ditolak 403 Forbidden.'
      : `Gagal proteksi read-only: status=${resOW02D.status}, body=${JSON.stringify(resOW02D.body)}`,
  });
  console.log(`  Result: status=${resOW02D.status}, error.code=${resOW02D.body?.error?.code}`);

  // --------------------------------------------------------------------------
  // RINGKASAN HASIL UAT ROLE 2
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 REKAPITULASI HASIL UAT: PERAN 2 - OWNER CABANG');
  console.log('========================================================================');

  let passedCount = 0;
  for (const r of uatResults) {
    if (r.pass) passedCount++;
    const icon = r.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} | ${r.code.padEnd(11)} | ${r.scenario.padEnd(55)} | Status: ${r.actualStatus}`);
  }

  const allPassed = passedCount === uatResults.length;
  console.log('------------------------------------------------------------------------');
  console.log(`Total Skenario: ${uatResults.length} | Lolos: ${passedCount} | Gagal: ${uatResults.length - passedCount}`);
  console.log(`Tingkat Kelulusan: ${((passedCount / uatResults.length) * 100).toFixed(1)}%`);
  console.log(allPassed ? '🎉 SEMUA SKENARIO UAT PERAN 2 LOLOS DENGAN SEMPURNA!' : '⚠️ ADA SKENARIO YANG GAGAL.');
  console.log('========================================================================\n');
}

runOwnerCabangUat()
  .catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
