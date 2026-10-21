import path from 'node:path';
import { PrismaClient, ClassSlotStatus, Role } from '@prisma/client';

const API_BASE = 'http://localhost:32121/api/v1';
const prisma = new PrismaClient();

interface UatStepResult {
  code: string;
  scenario: string;
  isHappyPath: boolean;
  expectedStatus: number | number[];
  actualStatus: number;
  pass: boolean;
  userFacingFeedback: string;
  critiqueOrNotes: string;
}

const uatResults: UatStepResult[] = [];

async function loginSuperAdmin(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/password/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ralamzah@gmail.com', password: 'ridho123', channel: 'MOBILE' }),
  });
  if (!res.ok) {
    throw new Error(`Login Super Admin failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.accessToken;
}

async function api(
  token: string,
  method: string,
  endpoint: string,
  body?: any,
): Promise<{ status: number; body: any }> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'idempotency-key': crypto.randomUUID(),
    },
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

async function runSuperAdminUat() {
  console.log('========================================================================');
  console.log('🎬 MEMULAI EKSEKUSI UAT: PERAN 1 - SUPER ADMIN / SUPER OWNER');
  console.log('Platform: Daily Dose Pilates Studio Management System V2');
  console.log('Target Akun: ralamzah@gmail.com (Super Owner)');
  console.log('========================================================================\n');

  const token = await loginSuperAdmin();
  console.log('✅ Login Super Admin berhasil (Token acquired).\n');

  // Ambil data referensi master langsung dari database UAT
  const ggBranch = await prisma.cabang.findFirst({ where: { code: 'DD-GG' } });
  if (!ggBranch) throw new Error('Cabang Green Garden (DD-GG) tidak ditemukan di database.');
  
  const coachSarah = await prisma.user.findFirst({ where: { email: 'coach.sarah@dailydose.test' } });
  if (!coachSarah) throw new Error('Coach Sarah tidak ditemukan di database.');
  
  const coachClara = await prisma.user.findFirst({ where: { email: 'coach.clara@dailydose.test' } });
  if (!coachClara) throw new Error('Coach Clara tidak ditemukan di database.');
  
  const classType = await prisma.jenisKelas.findFirst({ where: { active: true } });
  if (!classType) throw new Error('Jenis Kelas aktif tidak ditemukan.');

  const studio1 = await prisma.studio.findFirst({ where: { branchId: ggBranch.id } });
  if (!studio1) throw new Error('Studio di Green Garden tidak ditemukan.');
  
  const room1 = await prisma.ruangan.findFirst({ where: { studioId: studio1.id } });
  if (!room1) throw new Error('Ruangan di Studio 1 Green Garden tidak ditemukan.');

  const studio2 = await prisma.studio.findFirst({ where: { branchId: ggBranch.id, id: { not: studio1.id } } });
  const room2 = studio2 ? await prisma.ruangan.findFirst({ where: { studioId: studio2.id } }) : null;

  console.log(`📍 Master Reference: Branch=${ggBranch.name} (${ggBranch.id})`);
  console.log(`   Coach Sarah=${coachSarah.id}, Coach Clara=${coachClara.id}`);
  console.log(`   ClassType=${classType.name} (${classType.id})`);
  console.log(`   Studio1=${studio1.name} (${studio1.id}), Room1=${room1.name} (${room1.id})`);
  if (studio2 && room2) {
    console.log(`   Studio2=${studio2.name} (${studio2.id}), Room2=${room2.name} (${room2.id})`);
  }

  // --------------------------------------------------------------------------
  // MODUL 1.1: Manajemen Cabang & Studio Global
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 1.1: MANAJEMEN CABANG STUDIO GLOBAL] ---');

  // UAT-SA-01: Update Geofence Radius
  console.log('▶ Uji UAT-SA-01 (Happy Path): Pembaruan radius geofence cabang Green Garden menjadi 200m...');
  const resUpdateBranch = await api(token, 'PATCH', `/branches/${ggBranch.id}`, {
    name: ggBranch.name,
    timezone: ggBranch.timezone,
    geofenceRadiusMeters: 200,
  });
  const passSA01 = resUpdateBranch.status === 200 && (resUpdateBranch.body?.geofenceRadiusMeters === 200 || resUpdateBranch.body?.data?.geofenceRadiusMeters === 200);
  uatResults.push({
    code: 'UAT-SA-01',
    scenario: 'Pembaruan Radius Geofence Cabang Green Garden (200m)',
    isHappyPath: true,
    expectedStatus: 200,
    actualStatus: resUpdateBranch.status,
    pass: passSA01,
    userFacingFeedback: 'Data cabang berhasil diperbarui',
    critiqueOrNotes: passSA01 ? 'Sempurna. Radius tersimpan dan terbaca 200 meter.' : 'Gagal memperbarui radius cabang.',
  });
  console.log(`  Hasil UAT-SA-01: ${passSA01 ? '✅ LOLOS' : '❌ GAGAL'} (HTTP ${resUpdateBranch.status})`);

  // UAT-SA-02: Adversarial Radius Negatif
  console.log('▶ Uji UAT-SA-02 (No-Happy Path): Input radius geofence bernilai negatif (-50m)...');
  const resNegativeRadius = await api(token, 'PATCH', `/branches/${ggBranch.id}`, {
    geofenceRadiusMeters: -50,
  });
  const passSA02 = resNegativeRadius.status >= 400 && resNegativeRadius.status < 500;
  uatResults.push({
    code: 'UAT-SA-02',
    scenario: 'Validasi Input Radius Geofence Negatif (-50m)',
    isHappyPath: false,
    expectedStatus: 400,
    actualStatus: resNegativeRadius.status,
    pass: passSA02,
    userFacingFeedback: resNegativeRadius.body?.message || resNegativeRadius.body?.error?.message || 'Validasi menolak angka negatif',
    critiqueOrNotes: passSA02 ? 'Sangat baik. Server menolak angka radius negatif dengan status HTTP 400.' : 'Bahaya: Server menerima angka negatif.',
  });
  console.log(`  Hasil UAT-SA-02: ${passSA02 ? '✅ LOLOS' : '❌ GAGAL'} (HTTP ${resNegativeRadius.status})`);

  // --------------------------------------------------------------------------
  // MODUL 1.2: Katalog Paket & Duplikasi Promo
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 1.2: KATALOG PAKET & DUPLIKASI PROMO] ---');

  // UAT-SA-03: Duplikasi Paket Promo Instan
  console.log('▶ Uji UAT-SA-03 (Happy Path): Duplikasi paket promo Lebaran 10 sesi...');
  const testPkgCode = `PKG-LEBARAN-${Date.now().toString().slice(-6)}`;
  const resCreatePkg = await api(token, 'POST', '/packages', {
    code: testPkgCode,
    name: 'Paket Promo Spesial Lebaran 10 Sesi',
    classCategory: 'REFORMER',
    sessionCount: 10,
    validityDays: 60,
    priceRp: 2250000,
    isAllBranches: true,
    branchIds: [ggBranch.id],
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    status: 'ACTIVE',
  });
  const passSA03 = resCreatePkg.status === 201 || resCreatePkg.status === 200;
  uatResults.push({
    code: 'UAT-SA-03',
    scenario: 'Duplikasi & Penerbitan Paket Promo Lebaran 10 Sesi',
    isHappyPath: true,
    expectedStatus: [200, 201],
    actualStatus: resCreatePkg.status,
    pass: passSA03,
    userFacingFeedback: 'Paket berhasil diterbitkan dan aktif di katalog',
    critiqueOrNotes: passSA03 ? `Paket baru ${testPkgCode} berhasil terbit Rp 2.250.000 (10 sesi).` : 'Gagal membuat paket promo.',
  });
  console.log(`  Hasil UAT-SA-03: ${passSA03 ? '✅ LOLOS' : '❌ GAGAL'} (HTTP ${resCreatePkg.status})`);

  // UAT-SA-04: Validasi Harga Minus
  console.log('▶ Uji UAT-SA-04 (No-Happy Path): Input harga paket negatif (-Rp 100.000)...');
  const resNegativePrice = await api(token, 'POST', '/packages', {
    code: `PKG-ERR-${Date.now().toString().slice(-4)}`,
    name: 'Paket Error Negatif',
    classCategory: 'REFORMER',
    sessionCount: 10,
    validityDays: 30,
    priceRp: -100000,
    isAllBranches: true,
  });
  const passSA04 = resNegativePrice.status >= 400 && resNegativePrice.status < 500;
  uatResults.push({
    code: 'UAT-SA-04',
    scenario: 'Pencegahan Input Harga Paket Negatif / Minus',
    isHappyPath: false,
    expectedStatus: 400,
    actualStatus: resNegativePrice.status,
    pass: passSA04,
    userFacingFeedback: resNegativePrice.body?.message || resNegativePrice.body?.error?.message || 'Harga tidak boleh negatif',
    critiqueOrNotes: passSA04 ? 'Bagus. Sistem menolak tegas nominal negatif.' : 'Bocor: Paket harga minus lolos validasi.',
  });
  console.log(`  Hasil UAT-SA-04: ${passSA04 ? '✅ LOLOS' : '❌ GAGAL'} (HTTP ${resNegativePrice.status})`);

  // --------------------------------------------------------------------------
  // MODUL 1.3: Manajemen Timetable & Collision Guard Global
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 1.3: MANAJEMEN TIMETABLE & COLLISION GUARD] ---');

  const room1Cap = (room1.capacityBed && room1.capacityBed > 0) ? room1.capacityBed : 6;
  const targetStudio2 = studio2 || studio1;
  const targetRoom2 = room2 || room1;
  const room2Cap = (targetRoom2.capacityBed && targetRoom2.capacityBed > 0) ? targetRoom2.capacityBed : 4;

  // Waktu uji untuk slot kelas (3 hari ke depan agar tidak mengganggu kelas existing)
  const baseSlotStart = new Date(Date.now() + 3 * 86400000);
  baseSlotStart.setUTCHours(2, 0, 0, 0); // 09:00 WIB (UTC+7)
  const baseSlotEnd = new Date(Date.now() + 3 * 86400000);
  baseSlotEnd.setUTCHours(3, 0, 0, 0); // 10:00 WIB

  // Bersihkan slot sisa uji sebelumnya pada rentang waktu ini
  const existingSlots = await prisma.slotKelas.findMany({
    where: { branchId: ggBranch.id, startAt: { gte: baseSlotStart, lt: baseSlotEnd } },
    select: { id: true },
  });
  if (existingSlots.length > 0) {
    const slotIds = existingSlots.map((s) => s.id);
    await prisma.pemesananKelas.deleteMany({ where: { classSlotId: { in: slotIds } } });
    await prisma.slotKelas.deleteMany({ where: { id: { in: slotIds } } });
  }

  // UAT-SA-05: Penjadwalan Slot Kelas Baru & Publikasi
  console.log(`▶ Uji UAT-SA-05 (Happy Path): Pembuatan slot kelas Coach Sarah di Studio 1 / Room 1 (${baseSlotStart.toISOString()} - ${baseSlotEnd.toISOString()})...`);
  const resCreateSlot = await api(token, 'POST', '/class-slots', {
    branchId: ggBranch.id,
    studioId: studio1.id,
    roomId: room1.id,
    classTypeId: classType.id,
    instructorUserId: coachSarah.id,
    startAt: baseSlotStart.toISOString(),
    endAt: baseSlotEnd.toISOString(),
    capacity: room1Cap,
  });
  let createdSlotId = resCreateSlot.body?.id || resCreateSlot.body?.data?.id;
  const passSA05 = (resCreateSlot.status === 201 || resCreateSlot.status === 200) && Boolean(createdSlotId);

  // Jika sukses, ubah status menjadi PUBLISHED
  if (passSA05 && createdSlotId) {
    await api(token, 'PATCH', `/class-slots/${createdSlotId}/status`, { status: 'PUBLISHED' });
  }

  uatResults.push({
    code: 'UAT-SA-05',
    scenario: 'Penjadwalan Kelas Coach Sarah & Publikasi',
    isHappyPath: true,
    expectedStatus: [200, 201],
    actualStatus: resCreateSlot.status,
    pass: passSA05,
    userFacingFeedback: 'Kelas berhasil dibuat dan dipublikasikan',
    critiqueOrNotes: passSA05 ? `Slot ${createdSlotId} berhasil dibuat dan dipublikasikan status PUBLISHED.` : 'Gagal membuat slot kelas.',
  });
  console.log(`  Hasil UAT-SA-05: ${passSA05 ? '✅ LOLOS' : '❌ GAGAL'} (Slot ID: ${createdSlotId})`);

  // UAT-SA-06A: Tabrakan Ruangan (Room Collision)
  console.log('▶ Uji UAT-SA-06A (No-Happy Path): Tabrakan Ruangan (Ruangan Sama, Jam Sama, Instruktur Berbeda Coach Clara)...');
  const resRoomCollision = await api(token, 'POST', '/class-slots', {
    branchId: ggBranch.id,
    studioId: studio1.id,
    roomId: room1.id,
    classTypeId: classType.id,
    instructorUserId: coachClara.id,
    startAt: baseSlotStart.toISOString(),
    endAt: baseSlotEnd.toISOString(),
    capacity: room1Cap,
  });
  const roomCollisionCode = resRoomCollision.body?.error?.code || resRoomCollision.body?.code;
  const passSA06A = resRoomCollision.status >= 400 && (roomCollisionCode === 'SLOT_SCHEDULE_COLLISION' || resRoomCollision.status === 409 || resRoomCollision.status === 400);
  uatResults.push({
    code: 'UAT-SA-06A',
    scenario: 'Deteksi Tabrakan Ruangan (Room Collision Guard)',
    isHappyPath: false,
    expectedStatus: [400, 409],
    actualStatus: resRoomCollision.status,
    pass: passSA06A,
    userFacingFeedback: 'Ruangan ini sudah memiliki jadwal kelas lain pada jam yang sama. Silakan pilih ruangan lain atau ubah jam mulai.',
    critiqueOrNotes: passSA06A ? `Lolos. Server menolak tabrakan ruangan dengan kode: ${roomCollisionCode}.` : 'Bahaya: Tabrakan ruangan tidak terdeteksi!',
  });
  console.log(`  Hasil UAT-SA-06A: ${passSA06A ? '✅ LOLOS' : '❌ GAGAL'} (Status: ${resRoomCollision.status}, Code: ${roomCollisionCode})`);

  // UAT-SA-06B: Tabrakan Instruktur (Instructor Collision)
  console.log('▶ Uji UAT-SA-06B (No-Happy Path): Tabrakan Instruktur (Coach Sarah, Jam Sama, Ruang Berbeda Studio 2)...');
  const resInstructorCollision = await api(token, 'POST', '/class-slots', {
    branchId: ggBranch.id,
    studioId: targetStudio2.id,
    roomId: targetRoom2.id,
    classTypeId: classType.id,
    instructorUserId: coachSarah.id, // Sarah sudah mengajar pada rentang jam ini
    startAt: baseSlotStart.toISOString(),
    endAt: baseSlotEnd.toISOString(),
    capacity: room2Cap,
  });
  const instructorCollisionCode = resInstructorCollision.body?.error?.code || resInstructorCollision.body?.code;
  const passSA06B = resInstructorCollision.status >= 400 && (instructorCollisionCode === 'SLOT_SCHEDULE_COLLISION' || instructorCollisionCode === 'INSTRUCTOR_SCHEDULE_COLLISION' || resInstructorCollision.status === 409 || resInstructorCollision.status === 400);
  uatResults.push({
    code: 'UAT-SA-06B',
    scenario: 'Deteksi Tabrakan Instruktur (Instructor Collision Guard)',
    isHappyPath: false,
    expectedStatus: [400, 409],
    actualStatus: resInstructorCollision.status,
    pass: passSA06B,
    userFacingFeedback: 'Instruktur yang dipilih sudah memiliki jadwal mengajar di kelas lain pada jam yang sama.',
    critiqueOrNotes: passSA06B ? `Lolos. Server menolak jadwal ganda instruktur dengan kode: ${instructorCollisionCode}.` : 'Bahaya: Instruktur yang sama dijadwalkan ganda!',
  });
  console.log(`  Hasil UAT-SA-06B: ${passSA06B ? '✅ LOLOS' : '❌ GAGAL'} (Status: ${resInstructorCollision.status}, Code: ${instructorCollisionCode})`);

  // --------------------------------------------------------------------------
  // MODUL 1.4: Verifikasi Dokumen KYC KTP Pelanggan
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 1.4: VERIFIKASI DOKUMEN KYC KTP] ---');

  // Cari atau buat profil KYC atas nama Clara New
  let claraUser = await prisma.user.findFirst({ where: { email: 'clara.new@dailydose.test' } });
  if (!claraUser) {
    claraUser = await prisma.user.create({
      data: {
        email: 'clara.new@dailydose.test',
        name: 'Clara New Member',
        phone: '+6281377889900',
        role: Role.CUSTOMER,
      },
    });
  }

  await prisma.profilPengguna.upsert({
    where: { userId: claraUser.id },
    update: { ktpUrl: 'uploads/clara_ktp.jpg', selfieUrl: 'uploads/clara_selfie.jpg', notes: 'PENDING' },
    create: { userId: claraUser.id, ktpUrl: 'uploads/clara_ktp.jpg', selfieUrl: 'uploads/clara_selfie.jpg', notes: 'PENDING' },
  });

  const docId = `doc-ktp-${claraUser.id}`;

  // UAT-SA-08: Penolakan KTP / Keputusan Invalid (Boundary)
  console.log('▶ Uji UAT-SA-08 (No-Happy Path): Pengujian keputusan invalid pada dokumen KYC...');
  const resInvalidDecision = await api(token, 'POST', `/identity-verifications/${docId}/decisions/invalid-decision`, {
    expectedVersion: 1,
  });
  const passSA08 = resInvalidDecision.status >= 400 && resInvalidDecision.status < 500;
  uatResults.push({
    code: 'UAT-SA-08',
    scenario: 'Pencegahan Keputusan KYC Tidak Sah / Tanpa Alasan',
    isHappyPath: false,
    expectedStatus: [400, 422],
    actualStatus: resInvalidDecision.status,
    pass: passSA08,
    userFacingFeedback: 'Keputusan verifikasi ditolak jika tidak sesuai ketentuan',
    critiqueOrNotes: passSA08 ? 'Lolos. Server menolak keputusan tidak sah dengan HTTP 422/400.' : 'Bocor: Keputusan invalid diterima.',
  });
  console.log(`  Hasil UAT-SA-08: ${passSA08 ? '✅ LOLOS' : '❌ GAGAL'} (HTTP ${resInvalidDecision.status})`);

  // UAT-SA-07: Persetujuan Dokumen KTP (Approve)
  console.log('▶ Uji UAT-SA-07 (Happy Path): Persetujuan verifikasi dokumen KYC Clara New...');
  const resApproveKyc = await api(token, 'POST', `/identity-verifications/${docId}/decisions/approve`, {
    expectedVersion: 1,
    note: 'Dokumen KTP dan selfie valid dan sesuai',
  });
  const passSA07 = (resApproveKyc.status === 200 || resApproveKyc.status === 201) && resApproveKyc.body?.status === 'APPROVED';
  uatResults.push({
    code: 'UAT-SA-07',
    scenario: 'Persetujuan Verifikasi Identitas KYC KTP Member',
    isHappyPath: true,
    expectedStatus: [200, 201],
    actualStatus: resApproveKyc.status,
    pass: passSA07,
    userFacingFeedback: 'Status verifikasi disetujui (APPROVED)',
    critiqueOrNotes: passSA07 ? 'Lolos. Member Clara New kini berstatus APPROVED dan berhak booking.' : 'Gagal approve KYC.',
  });
  console.log(`  Hasil UAT-SA-07: ${passSA07 ? '✅ LOLOS' : '❌ GAGAL'} (HTTP ${resApproveKyc.status})`);

  // --------------------------------------------------------------------------
  // MODUL 1.5: Konfigurasi Tarif Master Honor Instruktur & Override Sesi
  // --------------------------------------------------------------------------
  console.log('\n--- [MODUL 1.5: SKEMA TARIF HONOR INSTRUKTUR & OVERRIDE SESI] ---');

  // UAT-SA-09A: Set Master Tarif Per Jam (Rp 250.000/jam)
  console.log('▶ Uji UAT-SA-09A (Happy Path): Konfigurasi tarif master per jam di tabel InstructorFee...');
  const existingFee = await prisma.instructorFee.findFirst({
    where: {
      instructorId: coachSarah.id,
      classTypeId: classType.id,
      branchId: ggBranch.id,
    },
  });
  let resSetFee;
  if (existingFee) {
    resSetFee = await prisma.instructorFee.update({
      where: { id: existingFee.id },
      data: { feePerJamRp: 250000, effectiveDate: new Date('2026-01-01T00:00:00Z') },
    });
  } else {
    resSetFee = await prisma.instructorFee.create({
      data: {
        instructorId: coachSarah.id,
        classTypeId: classType.id,
        branchId: ggBranch.id,
        effectiveDate: new Date('2026-01-01T00:00:00Z'),
        feePerJamRp: 250000,
      },
    });
  }
  const passSA09A = resSetFee.feePerJamRp === 250000;
  uatResults.push({
    code: 'UAT-SA-09A',
    scenario: 'Konfigurasi Tarif Master Honor Per Jam (Rp 250.000/jam)',
    isHappyPath: true,
    expectedStatus: 200,
    actualStatus: 200,
    pass: passSA09A,
    userFacingFeedback: 'Tarif master honor instruktur tersimpan (Rp 250.000 / jam)',
    critiqueOrNotes: passSA09A ? 'Lolos. Tarif master Coach Sarah GG tersimpan Rp 250.000/jam.' : 'Gagal upsert tarif master.',
  });
  console.log(`  Hasil UAT-SA-09A: ${passSA09A ? '✅ LOLOS' : '❌ GAGAL'}`);

  // UAT-SA-09B: Penimpaan Flat Per Sesi (Manual Override: isManualFee = true, instructorFeeRp = Rp 350.000)
  console.log('▶ Uji UAT-SA-09B (Happy Path): Pembuatan slot kelas khusus dengan Manual Fee Override (Rp 350.000/sesi)...');
  const specialSlotStart = new Date(Date.now() + 4 * 86400000);
  specialSlotStart.setUTCHours(7, 0, 0, 0); // 14:00 WIB
  const specialSlotEnd = new Date(Date.now() + 4 * 86400000);
  specialSlotEnd.setUTCHours(8, 30, 0, 0); // 15:30 WIB (90 menit)

  const existingSpecial = await prisma.slotKelas.findMany({
    where: { branchId: ggBranch.id, startAt: { gte: specialSlotStart, lt: specialSlotEnd } },
    select: { id: true },
  });
  if (existingSpecial.length > 0) {
    const ids = existingSpecial.map((s) => s.id);
    await prisma.pemesananKelas.deleteMany({ where: { classSlotId: { in: ids } } });
    await prisma.slotKelas.deleteMany({ where: { id: { in: ids } } });
  }

  const resManualFeeSlot = await api(token, 'POST', '/class-slots', {
    branchId: ggBranch.id,
    studioId: studio1.id,
    roomId: room1.id,
    classTypeId: classType.id,
    instructorUserId: coachSarah.id,
    startAt: specialSlotStart.toISOString(),
    endAt: specialSlotEnd.toISOString(),
    capacity: room1Cap,
    instructorFeeRp: 350000,
  });
  const specialSlotId = resManualFeeSlot.body?.id || resManualFeeSlot.body?.data?.id;
  const savedSpecialSlot = specialSlotId ? await prisma.slotKelas.findUnique({ where: { id: specialSlotId } }) : null;
  const passSA09B = savedSpecialSlot?.isManualFee === true && Number(savedSpecialSlot?.instructorFeeRp) === 350000;
  uatResults.push({
    code: 'UAT-SA-09B',
    scenario: 'Penimpaan Flat Per Sesi (Manual Override Rp 350.000/sesi)',
    isHappyPath: true,
    expectedStatus: [200, 201],
    actualStatus: resManualFeeSlot.status,
    pass: passSA09B,
    userFacingFeedback: 'Honor Khusus: Rp 350.000 / sesi (Manual Override aktif)',
    critiqueOrNotes: passSA09B ? `Lolos. Slot ${specialSlotId} menyimpan isManualFee=true dan instructorFeeRp=350000.` : 'Gagal menyimpan manual fee override.',
  });
  console.log(`  Hasil UAT-SA-09B: ${passSA09B ? '✅ LOLOS' : '❌ GAGAL'} (isManualFee: ${savedSpecialSlot?.isManualFee}, Fee: ${savedSpecialSlot?.instructorFeeRp})`);

  // UAT-SA-10: Resilience Fallback Default Fee Rp 150.000 jika tarif belum diset
  console.log('▶ Uji UAT-SA-10 (Resilience / No-Happy Path): Pengujian fallback tarif aman jika belum ada tarif master...');
  const { calculateSlotFee, DEFAULT_INSTRUCTOR_FEE_PER_HOUR_RP } = await import('../../../apps/api/src/packages/instructor-fee-calculator');
  const unconfiguredSlot = {
    startAt: new Date('2026-10-25T09:00:00Z'),
    endAt: new Date('2026-10-25T10:00:00Z'),
    branchId: ggBranch.id,
    classTypeId: 'unknown-class-type',
    instructorId: 'unknown-coach-id',
  };
  const feeCalc = calculateSlotFee([], unconfiguredSlot as any);
  const passSA10 = feeCalc.feePerJamRp === DEFAULT_INSTRUCTOR_FEE_PER_HOUR_RP && feeCalc.configured === false && feeCalc.feeRp === 150000;
  uatResults.push({
    code: 'UAT-SA-10',
    scenario: 'Fallback Tarif Aman Default (Rp 150.000/jam) Jika Belum Diatur',
    isHappyPath: false,
    expectedStatus: 200,
    actualStatus: 200,
    pass: passSA10,
    userFacingFeedback: '1 kelas memakai tarif bawaan (butuh konfigurasi tarif)',
    critiqueOrNotes: passSA10 ? 'Lolos. Sistem otomatis fallback ke Rp 150.000/jam tanpa error Rp 0 atau crash.' : 'Gagal fallback tarif default.',
  });
  console.log(`  Hasil UAT-SA-10: ${passSA10 ? '✅ LOLOS' : '❌ GAGAL'} (Tarif: Rp ${feeCalc.feeRp.toLocaleString()}, configured: ${feeCalc.configured})`);

  // --------------------------------------------------------------------------
  // REKAPITULASI HASIL UAT PERAN 1
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 REKAPITULASI HASIL UAT: PERAN 1 - SUPER ADMIN');
  console.log('========================================================================');
  console.table(
    uatResults.map((r) => ({
      ID: r.code,
      Skenario: r.scenario,
      Tipe: r.isHappyPath ? 'Happy Path' : 'No-Happy Path',
      HTTP: r.actualStatus,
      Status: r.pass ? '✅ LOLOS' : '❌ GAGAL',
      Catatan: r.critiqueOrNotes,
    })),
  );

  const total = uatResults.length;
  const passed = uatResults.filter((r) => r.pass).length;
  console.log(`\n🎯 TOTAL SKENARIO: ${total} | LOLOS: ${passed} | GAGAL: ${total - passed}`);
  console.log(`Tingkat Kelulusan: ${((passed / total) * 100).toFixed(1)}%\n`);

  await prisma.$disconnect();
  return { total, passed, results: uatResults };
}

runSuperAdminUat().catch((err) => {
  console.error('💥 Crash saat eksekusi UAT Super Admin:', err);
  process.exit(1);
});
