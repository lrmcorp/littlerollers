import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const API_BASE = 'http://127.0.0.1:32121/api/v1';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat',
    },
  },
});

interface TestCaseResult {
  id: string;
  domain: string;
  name: string;
  expectedStatus: string;
  actualStatus: string;
  passed: boolean;
  notes: string;
}

const results: TestCaseResult[] = [];

function recordResult(res: TestCaseResult) {
  results.push(res);
  const icon = res.passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`   ${icon} ${res.id}: ${res.name}`);
  console.log(`       Ekspektasi : ${res.expectedStatus}`);
  console.log(`       Realisasi  : ${res.actualStatus}`);
  console.log(`       Catatan    : ${res.notes}\n`);
}

async function loginUser(email: string, password: string): Promise<{ cookie: string; user: any }> {
  const res = await fetch(`${API_BASE}/auth/password/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, channel: 'WEB' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Login failed for ${email}: HTTP ${res.status} ${JSON.stringify(err)}`);
  }
  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/dd_session=([^;]+)/);
  const cookie = match ? `dd_session=${match[1]}` : '';
  const data = await res.json();
  return { cookie, user: data.user };
}

async function runMasterNegativeSuite() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  DAILY DOSE PILATES V2 - MASTER NEGATIVE & RESILIENCE TESTING SUITE         ║');
  console.log('║     (Strict Negative, Anti-Fraud, Concurrency & Zero-Crash Hardening)        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // Siapkan sesi untuk masing-masing peran
  console.log('▶ Menyiapkan sesi autentikasi aktor...');
  const adminGGSession = await loginUser('admin.gg@dailydose.test', 'AdminPass123!');
  const financeMKSession = await loginUser('finance.mk@dailydose.test', 'FinancePass123!');
  const memberJessicaSession = await loginUser('jessica.uat@gmail.com', 'DailyDose2026!');
  const ownerSBYSession = await loginUser('owner.sby@dailydose.test', 'OwnerPass123!');
  const superOwnerSession = await loginUser('ralamzah@gmail.com', 'ridho123');
  console.log('   ✓ Seluruh sesi aktor (Admin, Finance, Member, Owner, SuperOwner) aktif.\n');

  const branchGG = await prisma.cabang.findFirst({ where: { code: 'DD-GG' } });
  const branchMK = await prisma.cabang.findFirst({ where: { code: 'DD-MK' } });
  const instructor = await prisma.user.findFirst({ where: { role: 'INSTRUCTOR', status: 'ACTIVE' } });
  const studioGG = await prisma.studio.findFirst({ where: { branchId: branchGG?.id, active: true } });
  const classTypeReformer = await prisma.jenisKelas.findFirst({ where: { name: 'Group Class' } });
  const classTypeMat = await prisma.jenisKelas.findFirst({ where: { name: 'Private Class' } });
  const memberJessica = await prisma.user.findFirst({ where: { email: 'jessica.uat@gmail.com' } });

  if (!branchGG || !branchMK || !instructor || !studioGG || !classTypeReformer || !classTypeMat || !memberJessica) {
    throw new Error('Data referensi awal studio/kelas tidak lengkap.');
  }

  // ==========================================================================
  // DOMAIN 1: AUTENTIKASI & AKUN MALICIOUS
  // ==========================================================================
  console.log('▶ [DOMAIN 1/10] Autentikasi & Akun Malicious (Input & Auth Boundaries)...');

  // TC-NEG-01: Duplikasi Email
  try {
    const formData = new FormData();
    formData.append('displayName', 'Imposter Jessica');
    formData.append('email', 'jessica.uat@gmail.com');
    formData.append('phone', `0812${Math.floor(10000000 + Math.random() * 90000000)}`);
    formData.append('password', 'ValidPass123!');
    formData.append('consent', 'true');
    formData.append('selfie', new Blob(['fake'], { type: 'image/jpeg' }), 'selfie.jpg');
    formData.append('ktp', new Blob(['fake'], { type: 'image/jpeg' }), 'ktp.jpg');

    const res = await fetch(`${API_BASE}/auth/customer-registrations`, { method: 'POST', body: formData });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-01',
      domain: 'Autentikasi & Akun',
      name: 'Registrasi Duplikasi Email Terdaftar',
      expectedStatus: 'HTTP 409 Conflict (EMAIL_ALREADY_REGISTERED)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'BLOCKED'})`,
      passed: res.status === 409 && (data?.error?.code === 'EMAIL_ALREADY_REGISTERED' || data?.error?.code === 'CONFLICT'),
      notes: 'Sistem menolak duplikasi pendaftaran dengan email yang sama.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-01', domain: 'Autentikasi', name: 'Duplikasi Email', expectedStatus: '409', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // TC-NEG-02: Duplikasi Nomor HP
  try {
    const formData = new FormData();
    formData.append('displayName', 'Imposter Phone');
    formData.append('email', `unique_${Date.now()}@dailydose.test`);
    formData.append('phone', memberJessica.phone || '081299887766'); // No HP Jessica yang terdaftar!
    formData.append('password', 'ValidPass123!');
    formData.append('consent', 'true');
    formData.append('selfie', new Blob(['fake'], { type: 'image/jpeg' }), 'selfie.jpg');
    formData.append('ktp', new Blob(['fake'], { type: 'image/jpeg' }), 'ktp.jpg');

    const res = await fetch(`${API_BASE}/auth/customer-registrations`, { method: 'POST', body: formData });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-02',
      domain: 'Autentikasi & Akun',
      name: 'Registrasi Duplikasi Nomor Handphone',
      expectedStatus: 'HTTP 409 Conflict (PHONE_ALREADY_REGISTERED)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'BLOCKED'})`,
      passed: res.status === 409,
      notes: 'Sistem menolak duplikasi pendaftaran dengan nomor HP yang sama.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-02', domain: 'Autentikasi', name: 'Duplikasi Phone', expectedStatus: '409', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // TC-NEG-03: Password Kurang dari Standar (< 8 karakter)
  try {
    const formData = new FormData();
    formData.append('displayName', 'Weak Pass User');
    formData.append('email', `weak_${Date.now()}@dailydose.test`);
    formData.append('phone', `0855${Math.floor(10000000 + Math.random() * 90000000)}`);
    formData.append('password', '123');
    formData.append('consent', 'true');
    formData.append('selfie', new Blob(['fake'], { type: 'image/jpeg' }), 'selfie.jpg');
    formData.append('ktp', new Blob(['fake'], { type: 'image/jpeg' }), 'ktp.jpg');

    const res = await fetch(`${API_BASE}/auth/customer-registrations`, { method: 'POST', body: formData });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-03',
      domain: 'Autentikasi & Akun',
      name: 'Registrasi Password Lemah (< 8 Karakter)',
      expectedStatus: 'HTTP 400 Bad Request / 422 Unprocessable',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'VALIDATION_FAILED'})`,
      passed: res.status === 400 || res.status === 422,
      notes: 'Sistem memvalidasi kompleksitas password minimum.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-03', domain: 'Autentikasi', name: 'Password Lemah', expectedStatus: '400', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // TC-NEG-04: Login Akun Inactive / Suspended
  try {
    const inactiveUser = await prisma.user.findFirst({ where: { status: 'INACTIVE' } });
    if (inactiveUser && inactiveUser.email) {
      const res = await fetch(`${API_BASE}/auth/password/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inactiveUser.email, password: 'AnyPassword123!', channel: 'WEB' }),
      });
      const data: any = await res.json().catch(() => ({}));
      recordResult({
        id: 'TC-NEG-04',
        domain: 'Autentikasi & Akun',
        name: 'Login Akun Berstatus INACTIVE / Nonaktif',
        expectedStatus: 'HTTP 401 Unauthorized / 403 Forbidden (ACCOUNT_INACTIVE)',
        actualStatus: `HTTP ${res.status} (${data?.error?.code || 'REJECTED'})`,
        passed: res.status === 401 || res.status === 403,
        notes: 'Akun nonaktif dicegah dari membuat sesi login aktif.',
      });
    }
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-04', domain: 'Autentikasi', name: 'Login Inactive', expectedStatus: '401/403', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // ==========================================================================
  // DOMAIN 2: KYC GATE & VALIDASI BERKAS
  // ==========================================================================
  console.log('\n▶ [DOMAIN 2/10] KYC Gate & Validasi Berkas Keamanan (Identity Guard)...');

  // Buat user unverified dengan password hash dari Jessica
  const unverifiedEmail = `unverified_${Date.now()}@dailydose.test`;
  const unverifiedPassword = 'DailyDose2026!';

  const unverifiedUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      displayName: 'Unverified Tester',
      email: unverifiedEmail,
      passwordHash: memberJessica.passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profile: {
        create: {
          id: randomUUID(),
          fullName: 'Unverified Tester',
        },
      },
    },
  });

  const unverifiedSession = await loginUser(unverifiedEmail, unverifiedPassword);

  // TC-NEG-05: Member Unverified Mencoba Booking
  // Gunakan slot yang ada dari DB agar routing mencapai KYC gate (bukan 404 dulu)
  const anyPublishedSlot = await prisma.slotKelas.findFirst({ where: { status: 'PUBLISHED' } });
  const anyPkg = await prisma.paketPelanggan.findFirst({ where: { userId: memberJessica.id, remainingSessions: { gt: 0 } } });
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: unverifiedSession.cookie,
        'idempotency-key': `unverified-book-${randomUUID()}`,
      },
      body: JSON.stringify({
        classSlotId: anyPublishedSlot?.id ?? randomUUID(),
        customerPackageId: anyPkg?.id ?? randomUUID(),
        source: 'SELF',
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    // KYC gate dieksekusi SEBELUM validasi slot — 403 IDENTITY_VERIFICATION_REQUIRED
    recordResult({
      id: 'TC-NEG-05',
      domain: 'KYC & Berkas',
      name: 'Bypass KYC: Member UNVERIFIED Mencoba Booking Kelas',
      expectedStatus: 'HTTP 403 Forbidden (IDENTITY_VERIFICATION_REQUIRED)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'FORBIDDEN'})`,
      passed: res.status === 403 && data?.error?.code === 'IDENTITY_VERIFICATION_REQUIRED',
      notes: 'Member tanpa verifikasi KTP/Selfie diblokir total dari reservasi kelas.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-05', domain: 'KYC & Berkas', name: 'Bypass KYC', expectedStatus: '403', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // TC-NEG-06: Upload Berkas Malicious (.sh script)
  try {
    const formData = new FormData();
    formData.append('displayName', 'Malicious Script Tester');
    formData.append('email', `malicious_${Date.now()}@dailydose.test`);
    formData.append('phone', `0857${Math.floor(10000000 + Math.random() * 90000000)}`);
    formData.append('password', 'SecurePass123!');
    formData.append('consent', 'true');
    formData.append('ktp', new Blob(['#!/bin/bash\necho "pwned"'], { type: 'application/x-sh' }), 'exploit.sh');
    formData.append('selfie', new Blob(['fake image'], { type: 'image/jpeg' }), 'selfie.jpg');

    const res = await fetch(`${API_BASE}/auth/customer-registrations`, { method: 'POST', body: formData });
    const data: any = await res.json().catch(() => ({}));
    // CATATAN: Jika sistem mengembalikan 201, berarti validasi MIME type file KTP belum ketat.
    // Ini adalah TEMUAN keamanan nyata yang harus diperbaiki di layer upload.
    const isMimeRejected = res.status >= 400 && res.status < 500;
    recordResult({
      id: 'TC-NEG-06',
      domain: 'KYC & Berkas',
      name: 'Upload Berkas Berbahaya (.sh / non-image MIME type)',
      expectedStatus: 'HTTP 400 Bad Request / 415 / 422 (MIME Validation)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || (res.status === 201 ? 'TEMUAN: MIME tidak divalidasi, file .sh diterima!' : 'VALIDATION_FAILED')})`,
      passed: isMimeRejected,
      notes: isMimeRejected
        ? 'Sistem menolak tipe berkas non-gambar dengan aman tanpa crash 500.'
        : '[TEMUAN KEAMANAN] Sistem menerima upload file .sh (script) sebagai berkas KTP. Perlu ditambahkan validasi MIME type di multer/storage handler.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-06', domain: 'KYC & Berkas', name: 'Malicious File', expectedStatus: '400', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // ==========================================================================
  // DOMAIN 3: PAKET & KASIR IDEMPOTENSI
  // ==========================================================================
  console.log('\n▶ [DOMAIN 3/10] Paket & Kasir Idempotensi (Payment & Modality Guards)...');

  // TC-NEG-07: Double Approval Invoice PAID
  // Model yang benar adalah 'pembelian' (bukan 'pesananPaket')
  const paidInvoice = await prisma.pembelian.findFirst({
    where: { status: 'PAID' },
    orderBy: { createdAt: 'desc' },
  });

  if (paidInvoice) {
    const res = await fetch(`${API_BASE}/purchases/${paidInvoice.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: financeMKSession.cookie,
        'idempotency-key': `double-approve-${randomUUID()}`,
      },
      body: JSON.stringify({ note: 'Re-approve attempt' }),
    });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-07',
      domain: 'Paket & Kasir',
      name: 'Double Approval Invoice yang Sudah PAID (Idempotency Breach)',
      expectedStatus: 'HTTP 409 Conflict (PURCHASE_ALREADY_DECIDED)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'CONFLICT'})`,
      passed: res.status === 409 && data?.error?.code === 'PURCHASE_ALREADY_DECIDED',
      notes: 'Idempotensi kasir aktif: Invoice yang sudah lunas tidak dapat disetujui ulang.',
    });
  } else {
    recordResult({
      id: 'TC-NEG-07',
      domain: 'Paket & Kasir',
      name: 'Double Approval Invoice yang Sudah PAID (Idempotency Breach)',
      expectedStatus: 'HTTP 409 Conflict (PURCHASE_ALREADY_DECIDED)',
      actualStatus: 'SKIP: Tidak ada invoice berstatus PAID di UAT DB',
      passed: false,
      notes: 'Tidak ada data PAID di database UAT untuk diuji. Perlu seed data terlebih dahulu.',
    });
  }

  // TC-NEG-08: Modality Mismatch (Paket Reformer dipakai booking kelas Mat)
  const testPkgRef = await prisma.paket.create({
    data: {
      id: randomUUID(),
      branchId: branchGG.id,
      classTypeId: classTypeReformer.id,
      code: `PKG-REF-${Date.now().toString(36)}`,
      name: 'Paket Khusus Reformer Negatif',
      sessionCount: 5,
      validityDays: 30,
      priceRp: 500_000,
      status: 'ACTIVE',
    },
  });

  const custPkgRef = await prisma.paketPelanggan.create({
    data: {
      id: randomUUID(),
      userId: memberJessica!.id,
      packageId: testPkgRef.id,
      totalSessions: 5,
      remainingSessions: 5,
      usedSessions: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 86400000),
      status: 'ACTIVE',
    },
  });

  const slotMat = await prisma.slotKelas.create({
    data: {
      id: randomUUID(),
      branchId: branchGG.id,
      studioId: studioGG.id,
      classTypeId: classTypeMat.id,
      instructorId: instructor.id,
      startAt: new Date(Date.now() + 72 * 3600000),
      endAt: new Date(Date.now() + 73 * 3600000),
      capacity: 5,
      bookedCount: 0,
      status: 'PUBLISHED',
    },
  });

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: memberJessicaSession.cookie,
        'idempotency-key': `mismatch-${randomUUID()}`,
      },
      body: JSON.stringify({
        classSlotId: slotMat.id,
        customerPackageId: custPkgRef.id,
        source: 'SELF',
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-08',
      domain: 'Paket & Kasir',
      name: 'Modality Mismatch: Paket Reformer dipakai Pesan Kelas Mat Pilates',
      expectedStatus: 'HTTP 409 Conflict (PACKAGE_CLASS_TYPE_MISMATCH)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'CONFLICT'})`,
      passed: res.status === 409 && data?.error?.code === 'PACKAGE_CLASS_TYPE_MISMATCH',
      notes: 'Sistem menjaga batasan jenis paket agar tidak disalahgunakan untuk kelas lain.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-08', domain: 'Paket & Kasir', name: 'Modality Mismatch', expectedStatus: '409', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // ==========================================================================
  // DOMAIN 4: PENJADWALAN STUDIO
  // ==========================================================================
  console.log('\n▶ [DOMAIN 4/10] Penjadwalan Studio (Collision & Boundary Constraints)...');

  const baseSlotTimeStart = new Date(Date.now() + 96 * 3600000);
  const baseSlotTimeEnd = new Date(Date.now() + 97 * 3600000);

  const baseSlot = await prisma.slotKelas.create({
    data: {
      id: randomUUID(),
      branchId: branchGG.id,
      studioId: studioGG.id,
      classTypeId: classTypeReformer.id,
      instructorId: instructor.id,
      startAt: baseSlotTimeStart,
      endAt: baseSlotTimeEnd,
      capacity: 5,
      bookedCount: 0,
      status: 'PUBLISHED',
    },
  });

  // TC-NEG-09: Collision Instruktur (Jadwal Bertabrakan)
  try {
    const res = await fetch(`${API_BASE}/class-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminGGSession.cookie,
        'idempotency-key': `clash-inst-${randomUUID()}`,
      },
      body: JSON.stringify({
        branchId: branchGG.id,
        studioId: studioGG.id,
        classTypeId: classTypeReformer.id,
        instructorId: instructor.id, // Instruktur SAMA
        startAt: baseSlotTimeStart.toISOString(), // Jam SAMA
        endAt: baseSlotTimeEnd.toISOString(),
        capacity: 5,
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-09',
      domain: 'Penjadwalan Studio',
      name: 'Collision Instruktur: Menugaskan Instruktur Sama di Jam Bertabrakan',
      expectedStatus: 'HTTP 409 Conflict (SLOT_SCHEDULE_COLLISION)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'CONFLICT'})`,
      passed: res.status === 409 && data?.error?.code === 'SLOT_SCHEDULE_COLLISION',
      notes: 'Sistem mendeteksi jadwal ganda instruktur dan memblokir tabrakan kelas.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-09', domain: 'Penjadwalan', name: 'Collision Instruktur', expectedStatus: '409', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // TC-NEG-10: Collision Ruangan / Studio (Ruang Bertabrakan)
  try {
    const anotherInstructor = await prisma.user.create({
      data: {
        id: randomUUID(),
        displayName: 'Guest Instructor Neg',
        email: `guest_inst_${Date.now()}@dailydose.test`,
        role: 'INSTRUCTOR',
        status: 'ACTIVE',
      },
    });

    const res = await fetch(`${API_BASE}/class-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminGGSession.cookie,
        'idempotency-key': `clash-room-${randomUUID()}`,
      },
      body: JSON.stringify({
        branchId: branchGG.id,
        studioId: studioGG.id, // Studio SAMA
        classTypeId: classTypeReformer.id,
        instructorId: anotherInstructor.id, // Instruktur berbeda
        startAt: baseSlotTimeStart.toISOString(), // Jam SAMA
        endAt: baseSlotTimeEnd.toISOString(),
        capacity: 5,
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-10',
      domain: 'Penjadwalan Studio',
      name: 'Collision Ruangan: Menggunakan Studio Sama di Jam Bertabrakan',
      expectedStatus: 'HTTP 409 Conflict (SLOT_SCHEDULE_COLLISION)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'CONFLICT'})`,
      passed: res.status === 409 && data?.error?.code === 'SLOT_SCHEDULE_COLLISION',
      notes: 'Sistem mencegah tumpang tindih penggunaan ruangan studio fisik.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-10', domain: 'Penjadwalan', name: 'Collision Ruangan', expectedStatus: '409', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // TC-NEG-11: Publish Jadwal Tanpa Instruktur
  const slotDraftNoInst = await prisma.slotKelas.create({
    data: {
      id: randomUUID(),
      branchId: branchGG.id,
      studioId: studioGG.id,
      classTypeId: classTypeReformer.id,
      instructorId: null,
      startAt: new Date(Date.now() + 120 * 3600000),
      endAt: new Date(Date.now() + 121 * 3600000),
      capacity: 5,
      bookedCount: 0,
      status: 'DRAFT',
    },
  });

  try {
    const res = await fetch(`${API_BASE}/class-slots/${slotDraftNoInst.id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminGGSession.cookie,
        'idempotency-key': `publish-no-inst-${randomUUID()}`,
      },
      body: JSON.stringify({ expectedVersion: 1 }),
    });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-11',
      domain: 'Penjadwalan Studio',
      name: 'Publikasi Kelas DRAFT Tanpa Instruktur Ditugaskan',
      expectedStatus: 'HTTP 422 Unprocessable (INSTRUCTOR_REQUIRED)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'UNPROCESSABLE'})`,
      passed: res.status === 422 && data?.error?.code === 'INSTRUCTOR_REQUIRED',
      notes: 'Kelas tidak dapat dipublikasikan ke portal publik jika instruktur belum ditugaskan.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-11', domain: 'Penjadwalan', name: 'Publish No Inst', expectedStatus: '422', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // TC-NEG-12: Validasi Waktu Terbalik (startAt >= endAt)
  try {
    const res = await fetch(`${API_BASE}/class-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminGGSession.cookie,
        'idempotency-key': `time-err-${randomUUID()}`,
      },
      body: JSON.stringify({
        branchId: branchGG.id,
        studioId: studioGG.id,
        classTypeId: classTypeReformer.id,
        instructorId: instructor.id,
        startAt: new Date(Date.now() + 100 * 3600000).toISOString(),
        endAt: new Date(Date.now() + 90 * 3600000).toISOString(),
        capacity: 5,
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-12',
      domain: 'Penjadwalan Studio',
      name: 'Validasi Waktu Terbalik (Waktu Selesai Mendahului Waktu Mulai)',
      expectedStatus: 'HTTP 400 Bad Request (VALIDATION_ERROR)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'BAD_REQUEST'})`,
      passed: res.status === 400 && data?.error?.code === 'VALIDATION_ERROR',
      notes: 'Sistem menolak integritas rentang waktu kelas yang tidak logis.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-12', domain: 'Penjadwalan', name: 'Waktu Terbalik', expectedStatus: '400', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // ==========================================================================
  // DOMAIN 5: RESERVASI KELAS & KONKURENSI
  // ==========================================================================
  console.log('\n▶ [DOMAIN 5/10] Reservasi Kelas & Konkurensi (Race Condition & Balance Guards)...');

  // Siapkan member saldo 0 dengan password hash
  const emptyEmail = `empty_${Date.now()}@dailydose.test`;
  const emptyUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      displayName: 'Empty Balance Member',
      email: emptyEmail,
      passwordHash: memberJessica.passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profile: {
        create: {
          id: randomUUID(),
          fullName: 'Empty Balance Member',
          notes: 'KYC_APPROVED',
        },
      },
    },
  });

  const emptyPkg = await prisma.paketPelanggan.create({
    data: {
      id: randomUUID(),
      userId: emptyUser.id,
      packageId: testPkgRef.id,
      totalSessions: 5,
      remainingSessions: 0, // Saldo NOL!
      usedSessions: 5,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 86400000),
      status: 'ACTIVE',
    },
  });

  const emptySession = await loginUser(emptyEmail, 'DailyDose2026!');

  // TC-NEG-13: Booking dengan Saldo Nol
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: emptySession.cookie,
        'idempotency-key': `zero-bal-${randomUUID()}`,
      },
      body: JSON.stringify({
        classSlotId: baseSlot.id,
        customerPackageId: emptyPkg.id,
        source: 'SELF',
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-13',
      domain: 'Reservasi & Konkurensi',
      name: 'Booking Kelas dengan Saldo Kuota Sesi Nol (0)',
      expectedStatus: 'HTTP 409 Conflict (INSUFFICIENT_AVAILABLE_SESSIONS)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'CONFLICT'})`,
      passed: res.status === 409 && data?.error?.code === 'INSUFFICIENT_AVAILABLE_SESSIONS',
      notes: 'Sistem mencegah konsumsi kuota yang sudah habis.',
    });
  } catch (e: any) {
    recordResult({ id: 'TC-NEG-13', domain: 'Reservasi', name: 'Saldo Nol', expectedStatus: '409', actualStatus: 'ERROR', passed: false, notes: e.message });
  }

  // Siapkan 1 booking sah pertama untuk Jessica
  const jessicaActivePkg = await prisma.paketPelanggan.findFirst({
    where: {
      userId: memberJessica.id,
      remainingSessions: { gt: 0 },
      purchaseId: { not: null },
    },
  }) || await prisma.paketPelanggan.findFirst({
    where: { userId: memberJessica.id, remainingSessions: { gt: 0 } },
  });

  let booking1Id = '';
  if (jessicaActivePkg) {
    const b1Res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: memberJessicaSession.cookie,
        'idempotency-key': `b1-${randomUUID()}`,
      },
      body: JSON.stringify({
        classSlotId: baseSlot.id,
        customerPackageId: jessicaActivePkg.id,
        source: 'SELF',
      }),
    });
    const b1Data: any = await b1Res.json();
    booking1Id = b1Data.id;

    // TC-NEG-14: Double Booking pada Slot yang Sama
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: memberJessicaSession.cookie,
        'idempotency-key': `b2-${randomUUID()}`,
      },
      body: JSON.stringify({
        classSlotId: baseSlot.id,
        customerPackageId: jessicaActivePkg.id,
        source: 'SELF',
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-14',
      domain: 'Reservasi & Konkurensi',
      name: 'Double Booking: Member Memesan Slot yang Sama Dua Kali',
      expectedStatus: 'HTTP 409 Conflict (DUPLICATE_ACTIVE_BOOKING)',
      actualStatus: `HTTP ${res.status} (${data?.error?.code || 'CONFLICT'})`,
      passed: res.status === 409 && data?.error?.code === 'DUPLICATE_ACTIVE_BOOKING',
      notes: 'Sistem menolak pemesanan ganda aktif pada slot kelas yang sama.',
    });

    // TC-NEG-15: Overbooking Race Condition (Concurrency Stress Test)
    const raceSlot = await prisma.slotKelas.create({
      data: {
        id: randomUUID(),
        branchId: branchGG.id,
        studioId: studioGG.id,
        classTypeId: classTypeReformer.id,
        instructorId: instructor.id,
        startAt: new Date(Date.now() + 144 * 3600000),
        endAt: new Date(Date.now() + 145 * 3600000),
        capacity: 1, // Kapasitas HANYA 1
        bookedCount: 0,
        status: 'PUBLISHED',
      },
    });

    const rivalEmail = `rival_${Date.now()}@dailydose.test`;
    const userRival = await prisma.user.create({
      data: {
        id: randomUUID(),
        displayName: 'Rival Member Neg',
        email: rivalEmail,
        passwordHash: memberJessica.passwordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        profile: {
          create: {
            id: randomUUID(),
            fullName: 'Rival Member Neg',
            notes: 'KYC_APPROVED',
          },
        },
      },
    });

    const rivalPkg = await prisma.paketPelanggan.create({
      data: {
        id: randomUUID(),
        userId: userRival.id,
        packageId: jessicaActivePkg.packageId,
        totalSessions: 5,
        remainingSessions: 5,
        usedSessions: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 86400000),
        status: 'ACTIVE',
      },
    });

    const rivalSession = await loginUser(rivalEmail, 'DailyDose2026!');

    // Panggil 2 booking secara simultan via Promise.all
    const req1 = fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: memberJessicaSession.cookie,
        'idempotency-key': `race-1-${randomUUID()}`,
      },
      body: JSON.stringify({ classSlotId: raceSlot.id, customerPackageId: jessicaActivePkg.id, source: 'SELF' }),
    }).then(async (r) => ({ status: r.status, data: await r.json().catch(() => ({})) }));

    const req2 = fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: rivalSession.cookie,
        'idempotency-key': `race-2-${randomUUID()}`,
      },
      body: JSON.stringify({ classSlotId: raceSlot.id, customerPackageId: rivalPkg.id, source: 'SELF' }),
    }).then(async (r) => ({ status: r.status, data: await r.json().catch(() => ({})) }));

    const [raceRes1, raceRes2] = await Promise.all([req1, req2]);
    const successCount = (raceRes1.status === 200 || raceRes1.status === 201 ? 1 : 0) + (raceRes2.status === 200 || raceRes2.status === 201 ? 1 : 0);
    const failCount = (raceRes1.status === 409 ? 1 : 0) + (raceRes2.status === 409 ? 1 : 0);
    const failBody = raceRes1.status === 409 ? raceRes1.data : raceRes2.data;

    const finalRaceSlot = await prisma.slotKelas.findUnique({ where: { id: raceSlot.id } });

    recordResult({
      id: 'TC-NEG-15',
      domain: 'Reservasi & Konkurensi',
      name: 'Overbooking Race Condition: 2 Member Memperebutkan 1 Bed Terakhir',
      expectedStatus: 'Tepat 1 Sukses (200/201) & 1 Ditolak (409 CLASS_CAPACITY_FULL)',
      actualStatus: `${successCount} Sukses, ${failCount} Ditolak (${failBody?.error?.code || 'FULL'}), Final Booked: ${finalRaceSlot?.bookedCount}/${finalRaceSlot?.capacity}`,
      passed: successCount === 1 && failCount === 1 && finalRaceSlot?.bookedCount === 1 && failBody?.error?.code === 'CLASS_CAPACITY_FULL',
      notes: 'Pencegahan overbooking terbukti 100% thread-safe dan deterministik.',
    });

    // TC-NEG-16: Booking pada Kelas CANCELLED
    await prisma.slotKelas.update({
      where: { id: raceSlot.id },
      data: { status: 'CANCELLED' },
    });

    const cancelBookRes = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: memberJessicaSession.cookie,
        'idempotency-key': `cancel-book-${randomUUID()}`,
      },
      body: JSON.stringify({ classSlotId: raceSlot.id, customerPackageId: jessicaActivePkg.id, source: 'SELF' }),
    });
    const cancelBookData: any = await cancelBookRes.json().catch(() => ({}));
    recordResult({
      id: 'TC-NEG-16',
      domain: 'Reservasi & Konkurensi',
      name: 'Booking pada Slot Kelas yang Berstatus CANCELLED',
      expectedStatus: 'HTTP 404 Not Found / 409 Conflict',
      actualStatus: `HTTP ${cancelBookRes.status} (${cancelBookData?.error?.code || 'BLOCKED'})`,
      passed: cancelBookRes.status === 404 || cancelBookRes.status === 409,
      notes: 'Kelas yang dibatalkan tertutup dari segala reservasi baru.',
    });
  }

  // ========================================================================
  // DOMAIN 6: PRESENSI QR & REPLAY ATTACK
  // ========================================================================
  console.log('\n▶ [DOMAIN 6/10] Presensi QR & Replay Attack (Attendance Guards)...');

  if (booking1Id) {
    await prisma.pemesananKelas.update({
      where: { id: booking1Id },
      data: { status: 'ATTENDED' },
    });

    // TC-NEG-17: Replay Attack QR Tiket yang Sudah ATTENDED
    const replayRes = await fetch(`${API_BASE}/check-ins/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: `attended-token-${booking1Id}` }),
    });
    const replayData: any = await replayRes.json().catch(() => ({}));

    recordResult({
      id: 'TC-NEG-17',
      domain: 'Presensi QR',
      name: 'Replay Attack: Scan Tiket yang Sudah ATTENDED / Token Tidak Sah',
      expectedStatus: 'HTTP 400 Bad Request / 404 / 409 Conflict',
      actualStatus: `HTTP ${replayRes.status} (${replayData?.error?.code || 'BLOCKED'})`,
      passed: replayRes.status >= 400 && replayRes.status < 500,
      notes: 'Tiket QR berstatus ATTENDED atau token kedaluwarsa ditolak dari scan kedua.',
    });
  }

  // TC-NEG-18: Scan Tiket Berstatus CANCELLED
  const cancelledBooking = await prisma.pemesananKelas.create({
    data: {
      id: randomUUID(),
      bookingNumber: `BK-CANC-${Date.now().toString(36)}`,
      classSlotId: baseSlot.id,
      userId: memberJessica.id,
      customerPackageId: jessicaActivePkg!.id,
      status: 'CANCELLED',
    },
  });

  const scanCancelRes = await fetch(`${API_BASE}/check-ins/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: cancelledBooking.id }),
  });
  const scanCancelData: any = await scanCancelRes.json().catch(() => ({}));

  recordResult({
    id: 'TC-NEG-18',
    domain: 'Presensi QR',
    name: 'Scan Tiket yang Berstatus CANCELLED / Dibatalkan',
    expectedStatus: 'HTTP 400 / 404 / 409 (Ditolak)',
    actualStatus: `HTTP ${scanCancelRes.status} (${scanCancelData?.error?.code || 'BLOCKED'})`,
    passed: scanCancelRes.status >= 400 && scanCancelRes.status < 500,
    notes: 'Tiket yang dibatalkan tidak dapat digunakan untuk presensi studio.',
  });

  // ========================================================================
  // DOMAIN 7: PEMBATALAN & KEBIJAKAN HANGUS (LATE CANCEL)
  // ========================================================================
  console.log('\n▶ [DOMAIN 7/10] Pembatalan & Kebijakan Hangus (Late Cancel & Penalty Guards)...');

  // TC-NEG-19: Late Cancellation Policy (Cut-Off H-24 Forfeiture)
  const lateSlot = await prisma.slotKelas.create({
    data: {
      id: randomUUID(),
      branchId: branchGG.id,
      studioId: studioGG.id,
      classTypeId: classTypeReformer.id,
      instructorId: instructor.id,
      startAt: new Date(Date.now() + 2 * 3600000), // H-2 Jam!
      endAt: new Date(Date.now() + 3 * 3600000),
      capacity: 5,
      bookedCount: 1,
      status: 'PUBLISHED',
    },
  });

  const lateBooking = await prisma.pemesananKelas.create({
    data: {
      id: randomUUID(),
      bookingNumber: `BK-LATE-${Date.now().toString(36)}`,
      classSlotId: lateSlot.id,
      userId: memberJessica.id,
      customerPackageId: jessicaActivePkg!.id,
      status: 'BOOKED',
    },
  });

  const sessionsBeforeCancel = (await prisma.paketPelanggan.findUnique({ where: { id: jessicaActivePkg!.id } }))?.remainingSessions || 0;

  // Batalkan lewat API pembatalan
  const cancelRes = await fetch(`${API_BASE}/bookings/${lateBooking.id}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: memberJessicaSession.cookie,
      'idempotency-key': `late-cancel-${randomUUID()}`,
    },
    body: JSON.stringify({ reason: 'Mendadak sakit (Late Cancel)' }),
  });
  const cancelData: any = await cancelRes.json().catch(() => ({}));

  const sessionsAfterCancel = (await prisma.paketPelanggan.findUnique({ where: { id: jessicaActivePkg!.id } }))?.remainingSessions || 0;
  const canceledBookingRecord = await prisma.pemesananKelas.findUnique({ where: { id: lateBooking.id } });

  recordResult({
    id: 'TC-NEG-19',
    domain: 'Pembatalan & Penalty',
    name: 'Late Cancellation Policy: Pembatalan < H-24 Ditolak (Cut-off Violation)',
    expectedStatus: 'HTTP 409 Conflict (CANCELLATION_CUTOFF_PASSED)',
    actualStatus: `HTTP ${cancelRes.status} (${cancelData?.error?.code || 'BLOCKED'}), Booking: ${canceledBookingRecord?.status}, Saldo: ${sessionsBeforeCancel}→${sessionsAfterCancel}`,
    passed: cancelRes.status === 409 && cancelData?.error?.code === 'CANCELLATION_CUTOFF_PASSED' && canceledBookingRecord?.status === 'BOOKED' && sessionsAfterCancel === sessionsBeforeCancel,
    notes: 'Penegakan kebijakan cut-off pembatalan H-24 berhasil: Pembatalan terlambat ditolak sistem dengan aman.',
  });

  // TC-NEG-20: Pembatalan Booking yang Sudah ATTENDED
  const cancelAttendedRes = await fetch(`${API_BASE}/bookings/${booking1Id}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: memberJessicaSession.cookie,
      'idempotency-key': `cancel-att-${randomUUID()}`,
    },
    body: JSON.stringify({ reason: 'Coba batalkan kelas yang sudah dihadiri' }),
  });
  const cancelAttendedData: any = await cancelAttendedRes.json().catch(() => ({}));

  recordResult({
    id: 'TC-NEG-20',
    domain: 'Pembatalan & Penalty',
    name: 'Pembatalan Tiket Kelas yang Sudah Selesai Dihadiri (ATTENDED)',
    expectedStatus: 'HTTP 409 Conflict (ATTENDANCE_RECORDED / INVALID_STATE_TRANSITION)',
    actualStatus: `HTTP ${cancelAttendedRes.status} (${cancelAttendedData?.error?.code || 'CONFLICT'})`,
    passed: cancelAttendedRes.status === 409 && (cancelAttendedData?.error?.code === 'ATTENDANCE_RECORDED' || cancelAttendedData?.error?.code === 'INVALID_STATE_TRANSITION'),
    notes: 'Sistem menolak mutasi pembatalan untuk kelas yang sudah selesai dihadiri.',
  });

  // ==========================================================================
  // DOMAIN 8: SEGREGATION OF DUTIES (SOD) & FRAUD KOREKSI SALDO
  // ==========================================================================
  console.log('\n▶ [DOMAIN 8/10] Segregation of Duties (SOD) & Pencegahan Fraud Koreksi Saldo...');

  // Bersihkan request pending sebelumnya jika ada
  await prisma.sessionAdjustRequest.deleteMany({
    where: { customerPackageId: jessicaActivePkg!.id, status: 'PENDING' },
  }).catch(() => {});

  // Buat request adjustment oleh adminGG via API
  const adjReqRes = await fetch(`${API_BASE}/session-adjustments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminGGSession.cookie,
      'idempotency-key': `sod-req-${randomUUID()}`,
    },
    body: JSON.stringify({
      customerPackageId: jessicaActivePkg!.id,
      quantity: 1,
      reasonCode: 'PACKAGE_COMPENSATION',
      note: 'Pengajuan koreksi untuk uji SOD bypass',
    }),
  });
  const adjReqData: any = await adjReqRes.json();
  const adjRequestId = adjReqData.adjustment?.id || adjReqData.id;

  // TC-NEG-21: Self-Approval SOD Bypass
  const selfApproveRes = await fetch(`${API_BASE}/session-adjustments/${adjRequestId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminGGSession.cookie, // Admin pembuat mencoba approve!
      'idempotency-key': `self-appr-${randomUUID()}`,
    },
    body: JSON.stringify({
      reasonCode: 'CORRECTION_VERIFIED',
      expectedVersion: 1,
      note: 'Mencoba self-approve',
    }),
  });
  const selfApproveData: any = await selfApproveRes.json().catch(() => ({}));

  recordResult({
    id: 'TC-NEG-21',
    domain: 'Segregation of Duties',
    name: 'Self-Approval SOD Bypass: Pembuat Mencoba Menyetujui Pengajuannya Sendiri',
    expectedStatus: 'HTTP 403 Forbidden (SOD Violation / SEPARATION_OF_DUTIES)',
    actualStatus: `HTTP ${selfApproveRes.status} (${selfApproveData?.error?.code || 'FORBIDDEN'})`,
    passed: selfApproveRes.status === 403,
    notes: 'Prinsip SOD 100% ditegakkan: Frontdesk pembuat dilarang menyetujui permohonannya sendiri.',
  });

  // Setujui secara sah oleh Super Owner
  await fetch(`${API_BASE}/session-adjustments/${adjRequestId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: superOwnerSession.cookie,
      'idempotency-key': `legit-appr-${randomUUID()}`,
    },
    body: JSON.stringify({
      reasonCode: 'CORRECTION_VERIFIED',
      expectedVersion: 1,
      note: 'Disetujui sah oleh Super Owner',
    }),
  });

  // TC-NEG-22: Double Decision pada Koreksi Saldo yang Sudah Approved
  const doubleDecRes = await fetch(`${API_BASE}/session-adjustments/${adjRequestId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: superOwnerSession.cookie,
      'idempotency-key': `double-dec-${randomUUID()}`,
    },
    body: JSON.stringify({
      reasonCode: 'DUPLICATE_REQUEST',
      expectedVersion: 2,
      note: 'Mencoba reject adjustment yang sudah approved',
    }),
  });
  const doubleDecData: any = await doubleDecRes.json().catch(() => ({}));

  recordResult({
    id: 'TC-NEG-22',
    domain: 'Segregation of Duties',
    name: 'Double Decision: Mencoba Memutuskan Ulang Adjustment yang Sudah Selesai',
    expectedStatus: 'HTTP 409 Conflict (ADJUSTMENT_ALREADY_DECIDED)',
    actualStatus: `HTTP ${doubleDecRes.status} (${doubleDecData?.error?.code || 'CONFLICT'})`,
    passed: doubleDecRes.status === 409 && doubleDecData?.error?.code === 'ADJUSTMENT_ALREADY_DECIDED',
    notes: 'Status adjustment bersifat final dan tidak dapat ditimpa.',
  });

  // ==========================================================================
  // DOMAIN 9: FINANSIAL & PERIOD LOCK IMMUTABILITY
  // ==========================================================================
  console.log('\n▶ [DOMAIN 9/10] Finansial & Period Lock Immutability (Bookkeeping Guards)...');

  // TC-NEG-23: Mutasi Biaya pada Periode LOCKED
  const periodLockRes = await fetch(`${API_BASE}/other-costs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: financeMKSession.cookie,
      'idempotency-key': `inj-cost-${randomUUID()}`,
    },
    body: JSON.stringify({
      branchId: branchGG.id,
      period: '2026-10', // Periode yang LOCKED
      category: 'OPERATING_EXPENSE',
      description: 'Injeksi Biaya Ilegal Pasca Tutup Buku',
      amountRp: 750_000,
    }),
  });
  const periodLockData: any = await periodLockRes.json().catch(() => ({}));

  recordResult({
    id: 'TC-NEG-23',
    domain: 'Finansial & Tutup Buku',
    name: 'Mutasi Pengeluaran Baru pada Periode Finansial yang Sudah LOCKED',
    expectedStatus: 'HTTP 409 Conflict (PERIOD_ALREADY_LOCKED)',
    actualStatus: `HTTP ${periodLockRes.status} (${periodLockData?.error?.code || 'CONFLICT'})`,
    passed: periodLockRes.status === 409 && periodLockData?.error?.code === 'PERIOD_ALREADY_LOCKED',
    notes: 'Immutabilitas tutup buku terjaga: Periode terkunci menolak seluruh penambahan biaya baru.',
  });

  // TC-NEG-24: Akses Laporan Finansial oleh Staf Non-Finance (Frontdesk)
  const reportRes = await fetch(`${API_BASE}/finance/reports/omset?branchId=${branchGG.id}&period=2026-10`, {
    headers: { Cookie: adminGGSession.cookie },
  });
  const repData: any = await reportRes.json().catch(() => ({}));

  recordResult({
    id: 'TC-NEG-24',
    domain: 'Finansial & Tutup Buku',
    name: 'Akses Laporan Omset oleh Staf Non-Finance (Frontdesk Admin)',
    expectedStatus: 'HTTP 403 Forbidden',
    actualStatus: `HTTP ${reportRes.status} (${repData?.error?.code || 'FORBIDDEN'})`,
    passed: reportRes.status === 403,
    notes: 'Staf operasional tanpa kapabilitas finance:read diblokir dari laporan keuangan studio.',
  });

  // ==========================================================================
  // DOMAIN 10: MULTI-BRANCH ISOLATION & PRIVILEGE ESCALATION
  // ==========================================================================
  console.log('\n▶ [DOMAIN 10/10] Multi-Branch Isolation & Privilege Escalation (Tenant Guards)...');

  // TC-NEG-25: Horizontal Privilege Escalation Lintas Cabang (Owner Surabaya tembak Muara Karang)
  const crossBranchRes = await fetch(`${API_BASE}/finance/owner-branch-performance?branchId=${branchMK.id}`, {
    headers: { Cookie: ownerSBYSession.cookie },
  });
  const crossData: any = await crossBranchRes.json().catch(() => ({}));

  recordResult({
    id: 'TC-NEG-25',
    domain: 'Isolasi Multi-Cabang',
    name: 'Horizontal Privilege Escalation: Owner Surabaya Meminta Data Cabang Muara Karang',
    expectedStatus: 'HTTP 403 Forbidden (FORBIDDEN)',
    actualStatus: `HTTP ${crossBranchRes.status} (${crossData?.error?.code || 'BLOCKED'})`,
    passed: crossBranchRes.status === 403,
    notes: 'Akses lintas cabang ditolak 100% tanpa ada kebocoran angka finansial.',
  });

  // Cleanup data uji sementara
  await prisma.pemesananKelas.deleteMany({ where: { classSlotId: baseSlot.id } }).catch(() => {});
  await prisma.slotKelas.delete({ where: { id: baseSlot.id } }).catch(() => {});
  await prisma.slotKelas.delete({ where: { id: slotMat.id } }).catch(() => {});
  await prisma.paketPelanggan.delete({ where: { id: custPkgRef.id } }).catch(() => {});
  await prisma.paket.delete({ where: { id: testPkgRef.id } }).catch(() => {});
  await prisma.paketPelanggan.delete({ where: { id: emptyPkg.id } }).catch(() => {});
  await prisma.profilPengguna.deleteMany({ where: { userId: { in: [emptyUser.id, unverifiedUser.id] } } }).catch(() => {});
  await prisma.user.delete({ where: { id: emptyUser.id } }).catch(() => {});
  await prisma.user.delete({ where: { id: unverifiedUser.id } }).catch(() => {});

  // ==========================================================================
  // RINGKASAN REKAPITULASI
  // ==========================================================================
  const totalPassed = results.filter((r) => r.passed).length;
  const totalTests = results.length;
  const percentage = Math.round((totalPassed / totalTests) * 100);

  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║   HASIL AKHIR PENGUJIAN MURNI NEGATIF: ${totalPassed} / ${totalTests} KASUS LULUS (${percentage}%)         ║`);
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

  if (totalPassed === totalTests) {
    console.log('\n🏆 SELURUH 25 KASUS UJI NEGATIF & KETAHANAN LULUS SEMPURNA (100% PASS)!');
    console.log('🛡️ ZERO CRASH 500: Seluruh penolakan ditangani dengan graceful HTTP status.');
    console.log('🛡️ ZERO CORRUPTION: Integritas saldo sesi, jadwal, dan pembukuan tetap terjaga.');
    console.log('🛡️ ANTI-FRAUD TERBUKTI: SOD, Idempotency, Race Condition, & Isolasi Cabang Kedap.\n');
  } else {
    console.error(`\n⚠️ TERDAPAT ${totalTests - totalPassed} KASUS UJI YANG GAGAL. SILAKAN PERIKSA RINCIAN DI ATAS.`);
    process.exit(1);
  }
}

runMasterNegativeSuite()
  .catch((err) => {
    console.error('Fatal Runner Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
