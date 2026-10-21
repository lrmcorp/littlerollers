import { PrismaClient, ClassSlotStatus, Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash } from 'node:crypto';

const API_BASE = 'http://localhost:32121/api/v1';
const prisma = new PrismaClient();

interface UatResult {
  code: string;
  category: 'HAPPY_PATH' | 'NO_HAPPY_PATH';
  scenario: string;
  expectedStatus: number | number[];
  actualStatus: number;
  pass: boolean;
  notes: string;
}

const results: UatResult[] = [];

async function login(email: string, password = 'ridho123'): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/password/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, channel: 'MOBILE' }),
  });
  if (!res.ok) {
    throw new Error(`Login ${email} failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.accessToken;
}

async function api(
  token: string | null,
  method: string,
  endpoint: string,
  body?: any,
  idempotencyKey?: string,
): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (idempotencyKey) {
    headers['idempotency-key'] = idempotencyKey;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
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

function record(
  code: string,
  category: 'HAPPY_PATH' | 'NO_HAPPY_PATH',
  scenario: string,
  expectedStatus: number | number[],
  actualStatus: number,
  passCondition: boolean,
  notes: string,
) {
  const pass =
    (Array.isArray(expectedStatus)
      ? expectedStatus.includes(actualStatus)
      : actualStatus === expectedStatus) && passCondition;

  results.push({
    code,
    category,
    scenario,
    expectedStatus,
    actualStatus,
    pass,
    notes,
  });

  const icon = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] ${code} - ${scenario}`);
  console.log(`       Status: ${actualStatus} (Expected: ${JSON.stringify(expectedStatus)}) | ${notes}\n`);
}

async function runUat() {
  console.log('========================================================================');
  console.log('🏆 UAT & NO-HAPPY PATH: KIOSK DISPLAY & GEOFENCING PRESENSI INSTRUKTUR');
  console.log('Daily Dose Pilates Studio Management System V2');
  console.log('Target: 16 Skenario Komprehensif (6 Happy Path + 10 No-Happy Path)');
  console.log('========================================================================\n');

  // 1. Setup Auth Tokens
  console.log('🔑 Mengambil Access Token untuk Multi-Role Testing...');
  const coachSarahToken = await login('coach.sarah@dailydose.test', 'ridho123');
  const customerCindyToken = await login('cindyedelene@gmail.com', 'ridho123');

  // Pastikan ada Coach Budi (Second Instructor) untuk pengujian unauthorized instructor
  let coachBudi = await prisma.user.findFirst({ where: { email: 'coach.budi.uat@dailydose.test' } });
  if (!coachBudi) {
    const passwordHash = await argon2.hash('ridho123');
    coachBudi = await prisma.user.create({
      data: {
        email: 'coach.budi.uat@dailydose.test',
        displayName: 'Coach Budi UAT',
        role: Role.INSTRUCTOR,
        status: UserStatus.ACTIVE,
        passwordHash,
      },
    });
  }
  const coachBudiToken = await login('coach.budi.uat@dailydose.test', 'ridho123');

  console.log('✅ Token Coach Sarah (Assigned Instructor) Ready');
  console.log('✅ Token Coach Budi (Other Instructor) Ready');
  console.log('✅ Token Cindy (Customer / Member) Ready\n');

  // Master References
  const ggBranch = await prisma.cabang.findFirst({ where: { code: 'DD-GG' } });
  if (!ggBranch) throw new Error('Cabang Green Garden (DD-GG) tidak ditemukan.');

  // Pastikan koordinat GG terkonfigurasi
  const ggLat = -6.1685;
  const ggLng = 106.7628;
  await prisma.cabang.update({
    where: { id: ggBranch.id },
    data: { latitude: ggLat, longitude: ggLng, geofenceRadiusMeters: 200 },
  });

  const coachSarah = await prisma.user.findFirst({ where: { email: 'coach.sarah@dailydose.test' } });
  if (!coachSarah) throw new Error('Coach Sarah tidak ditemukan.');

  const classType = await prisma.jenisKelas.findFirst({ where: { active: true } });
  if (!classType) throw new Error('Jenis Kelas tidak ditemukan.');

  const studio = await prisma.studio.findFirst({ where: { branchId: ggBranch.id } });
  if (!studio) throw new Error('Studio Green Garden tidak ditemukan.');

  const room = await prisma.ruangan.findFirst({ where: { studioId: studio.id } });
  if (!room) throw new Error('Ruangan Studio Green Garden tidak ditemukan.');

  const now = new Date();

  // Helper pembuat Slot
  async function createSlot(startOffsetMinutes: number, durationMinutes = 60, instructorId = coachSarah.id, branchId = ggBranch.id) {
    const startAt = new Date(Date.now() + startOffsetMinutes * 60 * 1000);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);
    return prisma.slotKelas.create({
      data: {
        branchId,
        studioId: studio.id,
        roomId: room.id,
        classTypeId: classType.id,
        instructorId,
        startAt,
        endAt,
        capacity: 10,
        bookedCount: 1,
        status: ClassSlotStatus.CONFIRMED,
      },
    });
  }

  // =========================================================================
  // HAPPY PATH SCENARIOS
  // =========================================================================
  console.log('--- [BAGIAN 1: HAPPY PATH SCENARIOS] ---\n');

  // HP-01: Public Kiosk Branches Discovery
  const r1 = await api(null, 'GET', '/check-ins/kiosk/branches');
  record(
    'HP-01',
    'HAPPY_PATH',
    'Public Kiosk Branches Discovery (Akses Publik Tanpa Login Staf)',
    200,
    r1.status,
    Array.isArray(r1.body?.items) &&
      r1.body.items.some((b: any) => b.code === 'DD-GG' && b.hasGeofence === true && b.geofenceRadiusMeters === 200),
    `Ditemukan ${r1.body?.items?.length} cabang aktif dengan metadata geofence lengkap.`,
  );

  // Buat slot aktif untuk HP-02 & HP-03 (window OPEN, H-10 menit)
  const slotHP = await createSlot(-10, 60, coachSarah.id);

  // HP-02: Public Kiosk Display Live Active Session with QR Generation
  const r2 = await api(null, 'GET', '/check-ins/kiosk/dd-gg');
  const targetSlotHP = r2.body?.slots?.find((s: any) => s.id === slotHP.id);
  const qrPayloadHP = targetSlotHP?.qrPayload;
  const tokenHP = targetSlotHP?.token;
  record(
    'HP-02',
    'HAPPY_PATH',
    'Public Kiosk Display Sesi Aktif dengan Payload QR Deterministik',
    200,
    r2.status,
    targetSlotHP &&
      targetSlotHP.window === 'OPEN' &&
      targetSlotHP.isAttended === false &&
      typeof qrPayloadHP === 'string' &&
      qrPayloadHP.startsWith('dd-checkin:v1:') &&
      tokenHP.length === 43,
    `Slot aktif ditemukan: Window=OPEN, QR=${qrPayloadHP?.slice(0, 25)}... (Token length=${tokenHP?.length})`,
  );

  // HP-03: Deterministic Token Stability Test (Anti-flicker pada polling kiosk)
  const r3a = await api(null, 'GET', '/check-ins/kiosk/DD-GG');
  const r3b = await api(null, 'GET', '/check-ins/kiosk/DD-GG');
  const token3a = r3a.body?.slots?.find((s: any) => s.id === slotHP.id)?.token;
  const token3b = r3b.body?.slots?.find((s: any) => s.id === slotHP.id)?.token;
  record(
    'HP-03',
    'HAPPY_PATH',
    'Stabilitas Token Deterministik Kiosk (Anti-flicker Polling 20 Detik)',
    200,
    r3b.status,
    tokenHP === token3a && token3a === token3b,
    `Token stabil di 3 request berturut-turut (${tokenHP?.slice(0, 15)}...), kamera HP tidak flicker saat kiosk auto-refresh.`,
  );

  // HP-04: Instructor Check-In Within Studio Geofence
  // Koordinat ~10m dari Green Garden (-6.16851, 106.76281)
  const r4 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: tokenHP,
    latitude: -6.16851,
    longitude: 106.76281,
  }, `key-hp04-${slotHP.id}`);
  record(
    'HP-04',
    'HAPPY_PATH',
    'Presensi Instruktur Sukses Dalam Geofence Studio (Jarak ~10 Meter)',
    [200, 201],
    r4.status,
    r4.body?.body?.success === true &&
      r4.body?.body?.isWithinGeofence === true &&
      r4.body?.body?.type === 'INSTRUCTOR' &&
      typeof r4.body?.body?.distanceMeters === 'number' &&
      r4.body?.body?.distanceMeters <= 200,
    `Presensi TERVERIFIKASI: jarak fisik terdeteksi ${r4.body?.body?.distanceMeters}m dari studio Green Garden.`,
  );

  // HP-05: Kiosk Display Reflection of Verified Attendance
  const r5 = await api(null, 'GET', '/check-ins/kiosk/DD-GG');
  const updatedSlotHP = r5.body?.slots?.find((s: any) => s.id === slotHP.id);
  record(
    'HP-05',
    'HAPPY_PATH',
    'Pembaruan Real-Time Kiosk Display (Flipping QR ke Lencana Terverifikasi)',
    200,
    r5.status,
    updatedSlotHP &&
      updatedSlotHP.isAttended === true &&
      updatedSlotHP.qrPayload === null &&
      updatedSlotHP.attendance?.method === 'QR_SCAN' &&
      updatedSlotHP.attendance?.isWithinGeofence === true,
    `Kiosk live update: isAttended=true, QR ditutup otomatis, metode=${updatedSlotHP?.attendance?.method}.`,
  );

  // HP-06: Graceful Fallback on Branch Without Geofence Configured
  // Buat cabang baru sementara tanpa GPS
  const noGeoBranch = await prisma.cabang.create({
    data: {
      code: `DD-NOGEO-${Date.now().toString().slice(-4)}`,
      name: 'Daily Dose Studio Pop-up (No GPS)',
      address: 'Lokasi Event Pop-up',
      timezone: 'Asia/Jakarta',
      latitude: null,
      longitude: null,
      active: true,
    },
  });
  const noGeoStudio = await prisma.studio.create({
    data: {
      branchId: noGeoBranch.id,
      code: `STD-${Date.now().toString().slice(-4)}`,
      name: 'Pop-up Studio',
    },
  });
  const noGeoRoom = await prisma.ruangan.create({
    data: {
      studioId: noGeoStudio.id,
      code: `RM-${Date.now().toString().slice(-4)}`,
      name: 'Pop-up Room',
    },
  });
  const slotNoGeo = await prisma.slotKelas.create({
    data: {
      branchId: noGeoBranch.id,
      studioId: noGeoStudio.id,
      roomId: noGeoRoom.id,
      classTypeId: classType.id,
      instructorId: coachSarah.id,
      startAt: new Date(Date.now() - 5 * 60 * 1000),
      endAt: new Date(Date.now() + 55 * 60 * 1000),
      capacity: 10,
      bookedCount: 1,
      status: ClassSlotStatus.CONFIRMED,
    },
  });
  const rNoGeoKiosk = await api(null, 'GET', `/check-ins/kiosk/${noGeoBranch.code}`);
  const tokenNoGeo = rNoGeoKiosk.body?.slots?.find((s: any) => s.id === slotNoGeo.id)?.token;
  const r6 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: tokenNoGeo,
    // No GPS coordinates provided
  }, `key-hp06-${slotNoGeo.id}`);
  record(
    'HP-06',
    'HAPPY_PATH',
    'Fallback Adaptif pada Cabang Tanpa Koordinat Geofence (Graceful Fallback)',
    [200, 201],
    r6.status,
    r6.body?.body?.success === true &&
      r6.body?.body?.isWithinGeofence === true &&
      r6.body?.body?.distanceMeters === null,
    `Cabang tanpa koordinat GPS tetap berhasil presensi tanpa error koordinat.`,
  );

  // Clean up branch pop-up
  await prisma.kehadiranInstruktur.deleteMany({ where: { classSlotId: slotNoGeo.id } });
  await prisma.instructorCheckInToken.deleteMany({ where: { classSlotId: slotNoGeo.id } });
  await prisma.slotKelas.delete({ where: { id: slotNoGeo.id } });
  await prisma.ruangan.delete({ where: { id: noGeoRoom.id } });
  await prisma.studio.delete({ where: { id: noGeoStudio.id } });
  await prisma.cabang.delete({ where: { id: noGeoBranch.id } });

  // =========================================================================
  // NO-HAPPY PATH / NEGATIVE SCENARIOS
  // =========================================================================
  console.log('\n--- [BAGIAN 2: NO-HAPPY PATH & EDGE CASES] ---\n');

  // NHP-01: Invalid Branch Code on Kiosk Display
  const rNHP1 = await api(null, 'GET', '/check-ins/kiosk/CABANG-TIDAK-VALID-999');
  record(
    'NHP-01',
    'NO_HAPPY_PATH',
    'Akses Kiosk dengan Kode Cabang Fiktif / Tidak Terdaftar',
    404,
    rNHP1.status,
    rNHP1.body?.error?.code === 'RESOURCE_NOT_FOUND',
    `Ditolak 404 RESOURCE_NOT_FOUND: ${rNHP1.body?.error?.message}`,
  );

  // NHP-02: Slot Out of Window - Too Early (H > 30 mins)
  const slotEarly = await createSlot(120, 60, coachSarah.id); // 2 jam lagi
  const rNHP2 = await api(null, 'GET', '/check-ins/kiosk/DD-GG');
  const slotEarlyData = rNHP2.body?.slots?.find((s: any) => s.id === slotEarly.id);
  record(
    'NHP-02',
    'NO_HAPPY_PATH',
    'Sesi Kelas Terlalu Awal (Jadwal > 30 Menit ke Depan)',
    200,
    rNHP2.status,
    slotEarlyData && slotEarlyData.window === 'TOO_EARLY' && slotEarlyData.qrPayload === null,
    `Kiosk memproteksi sesi: window=TOO_EARLY, qrPayload=null (QR belum dimunculkan).`,
  );
  await prisma.slotKelas.delete({ where: { id: slotEarly.id } });

  // NHP-03: Slot Out of Window - Expired (Class slot has ended)
  const slotExpired = await createSlot(-90, 60, coachSarah.id); // Mulai 90m lalu, selesai 30m lalu
  const expiredRawToken = 'test-expired-token-raw-43chars-padded123456';
  const tokenHashExpired = createHash('sha256').update(expiredRawToken).digest('hex');
  await prisma.instructorCheckInToken.create({
    data: {
      classSlotId: slotExpired.id,
      token: tokenHashExpired,
      expiresAt: slotExpired.endAt,
    },
  });
  const rNHP3 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: expiredRawToken,
    latitude: ggLat,
    longitude: ggLng,
  }, `key-nhp03-${slotExpired.id}`);
  record(
    'NHP-03',
    'NO_HAPPY_PATH',
    'Pemindaian Token Sesi yang Sudah Berakhir (TOKEN_EXPIRED / WINDOW_CLOSED)',
    [410, 422],
    rNHP3.status,
    ['TOKEN_EXPIRED', 'CHECK_IN_WINDOW_CLOSED'].includes(rNHP3.body?.error?.code),
    `Ditolak ${rNHP3.status} ${rNHP3.body?.error?.code}: ${rNHP3.body?.error?.message}`,
  );
  await prisma.instructorCheckInToken.deleteMany({ where: { classSlotId: slotExpired.id } });
  await prisma.slotKelas.delete({ where: { id: slotExpired.id } });

  // NHP-04: Out of Geofence Check-In Attempt (Fraud Prevention)
  const slotGeoFraud = await createSlot(-10, 60, coachSarah.id);
  const rGeoFraudKiosk = await api(null, 'GET', '/check-ins/kiosk/DD-GG');
  const tokenFraud = rGeoFraudKiosk.body?.slots?.find((s: any) => s.id === slotGeoFraud.id)?.token;
  // Scan from Bandung (~150km away, -6.9000, 107.6000)
  const rNHP4 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: tokenFraud,
    latitude: -6.9000,
    longitude: 107.6000,
  }, `key-nhp04-${slotGeoFraud.id}`);
  record(
    'NHP-04',
    'NO_HAPPY_PATH',
    'Pencegahan Fraud: Percobaan Scan di Luar Radius Cabang (Bandung, ~150km)',
    [409, 422],
    rNHP4.status,
    rNHP4.body?.error?.code === 'OUT_OF_GEOFENCE',
    `Ditolak ${rNHP4.status} OUT_OF_GEOFENCE: Sistem mendeteksi jarak di luar radius geofence studio.`,
  );

  // NHP-05: Missing GPS Geolocation on Branch with Geofence Required
  const rNHP5 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: tokenFraud,
    // latitude & longitude omitted
  }, `key-nhp05-${slotGeoFraud.id}`);
  record(
    'NHP-05',
    'NO_HAPPY_PATH',
    'Pencegahan Fraud: Pemindaian Tanpa Koordinat GPS pada Cabang Ber-Geofence',
    422,
    rNHP5.status,
    rNHP5.body?.error?.code === 'GEOLOCATION_REQUIRED',
    `Ditolak 422 GEOLOCATION_REQUIRED: Instruktur wajib mengaktifkan GPS saat di studio.`,
  );

  // NHP-06: Unauthorized Instructor Scanning Another Instructor's Class
  const rNHP6 = await api(coachBudiToken, 'POST', '/check-ins/instructors', {
    token: tokenFraud,
    latitude: ggLat,
    longitude: ggLng,
  }, `key-nhp06-${slotGeoFraud.id}`);
  record(
    'NHP-06',
    'NO_HAPPY_PATH',
    'Instruktur Budi Mencoba Memindai Sesi Mengajar Coach Sarah',
    404,
    rNHP6.status,
    rNHP6.body?.error?.code === 'RESOURCE_NOT_FOUND',
    `Ditolak 404 RESOURCE_NOT_FOUND: Hanya instruktur yang ditugaskan yang diizinkan absen.`,
  );

  // NHP-07: Customer Account Scanning Instructor Kiosk QR
  const rNHP7 = await api(customerCindyToken, 'POST', '/check-ins/instructors', {
    token: tokenFraud,
    latitude: ggLat,
    longitude: ggLng,
  }, `key-nhp07-${slotGeoFraud.id}`);
  record(
    'NHP-07',
    'NO_HAPPY_PATH',
    'Customer / Member Mencoba Menggunakan Endpoint Presensi Instruktur',
    403,
    rNHP7.status,
    rNHP7.body?.error?.code === 'FORBIDDEN',
    `Ditolak 403 FORBIDDEN: Akun pelanggan tidak memiliki wewenang kehadiran instruktur.`,
  );

  // NHP-08: Token Replay / Double Check-In Attempt
  // Berhasilkan dulu scan slotGeoFraud
  await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: tokenFraud,
    latitude: ggLat,
    longitude: ggLng,
  }, `key-succ-nhp08-${slotGeoFraud.id}`);
  // Coba scan ulang token yang sama
  const rNHP8 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: tokenFraud,
    latitude: ggLat,
    longitude: ggLng,
  }, `key-replay-nhp08-${slotGeoFraud.id}`);
  record(
    'NHP-08',
    'NO_HAPPY_PATH',
    'Pencegahan Replay: Pemindaian Ulang Token yang Sudah Digunakan',
    409,
    rNHP8.status,
    rNHP8.body?.error?.code === 'TOKEN_ALREADY_USED',
    `Ditolak 409 TOKEN_ALREADY_USED: Token check-in sekali pakai tidak dapat digunakan ulang.`,
  );

  // NHP-09: Tampered / Malformed Kiosk Token
  const rNHP9 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: 'invalid-fake-token-string-that-does-not-exist',
    latitude: ggLat,
    longitude: ggLng,
  }, `key-nhp09-${Date.now()}`);
  record(
    'NHP-09',
    'NO_HAPPY_PATH',
    'Pemindaian Token Palsu / Ditempa / Tidak Terdaftar di Database',
    [404, 422],
    rNHP9.status,
    ['INVALID_TOKEN', 'TOKEN_NOT_FOUND', 'VALIDATION_ERROR'].includes(rNHP9.body?.error?.code),
    `Ditolak ${rNHP9.status} ${rNHP9.body?.error?.code}: Token QR tidak dikenali oleh sistem studio.`,
  );

  // NHP-10: Idempotency Replay Safeguard (Strict Single-Use Token Protection)
  const slotIdem = await createSlot(-5, 60, coachSarah.id);
  const rIdemKiosk = await api(null, 'GET', '/check-ins/kiosk/DD-GG');
  const tokenIdem = rIdemKiosk.body?.slots?.find((s: any) => s.id === slotIdem.id)?.token;
  const idemKey = `idem-key-test-${Date.now()}`;
  const rIdem1 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: tokenIdem,
    latitude: ggLat,
    longitude: ggLng,
  }, idemKey);
  const rIdem2 = await api(coachSarahToken, 'POST', '/check-ins/instructors', {
    token: tokenIdem,
    latitude: ggLat,
    longitude: ggLng,
  }, idemKey);
  record(
    'NHP-10',
    'NO_HAPPY_PATH',
    'Safeguard Single-Use Token: Replay Permintaan dengan Idempotency-Key yang Sama',
    409,
    rIdem2.status,
    rIdem2.body?.error?.code === 'TOKEN_ALREADY_USED',
    `Ditolak 409 TOKEN_ALREADY_USED: Memastikan token kiosk strictly single-use dan mencegah pencatatan honor ganda.`,
  );

  // Clean up test slots
  await prisma.kehadiranInstruktur.deleteMany({ where: { classSlotId: { in: [slotHP.id, slotGeoFraud.id, slotIdem.id] } } });
  await prisma.instructorCheckInToken.deleteMany({ where: { classSlotId: { in: [slotHP.id, slotGeoFraud.id, slotIdem.id] } } });
  await prisma.slotKelas.deleteMany({ where: { id: { in: [slotHP.id, slotGeoFraud.id, slotIdem.id] } } });

  // =========================================================================
  // REKAPITULASI HASIL UAT
  // =========================================================================
  console.log('\n========================================================================');
  console.log('📊 REKAPITULASI UAT & NO-HAPPY PATH: KIOSK DISPLAY & GEOFENCING');
  console.log('========================================================================');
  console.log('| Kode    | Kategori      | Skenario Pengujian                                     | Status |');
  console.log('| :-----: | :-----------: | :----------------------------------------------------- | :----: |');
  for (const r of results) {
    const s = r.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`| ${r.code.padEnd(7)} | ${r.category.padEnd(13)} | ${r.scenario.padEnd(54).slice(0, 54)} | ${s} |`);
  }

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  const pct = ((passed / total) * 100).toFixed(1);
  console.log('------------------------------------------------------------------------');
  console.log(`Total Skenario: ${total} | Lolos: ${passed} | Gagal: ${total - passed} | Success Rate: ${pct}%`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('🎉 SEMUA SKENARIO UAT & NO-HAPPY PATH LOLOS 100% DENGAN SEMPURNA!\n');
  } else {
    console.error(`⚠️ Terdapat ${total - passed} skenario yang belum lolos. Periksa log detail di atas.`);
    process.exitCode = 1;
  }
}

runUat()
  .catch((e) => {
    console.error('Fatal UAT Runner Error:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
