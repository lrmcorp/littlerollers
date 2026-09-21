import { PrismaClient, ClassSlotStatus, SessionMutationType, Role, UserStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { BookingsService } from '../apps/api/src/bookings/pemesanan-kelas.service';
import { ClassSlotService } from '../apps/api/src/classes/slot-kelas.service';
import { IdempotencyService } from '../apps/api/src/foundation/idempotency.service';
import { PolicyService } from '../apps/api/src/identity/policy.service';
import { RuntimeConfigService } from '../apps/api/src/configuration/runtime-config.service';
import { IdentityService } from '../apps/api/src/identity/identity.service';
import { RateLimitService } from '../apps/api/src/identity/rate-limit.service';
import type { SessionPrincipal } from '../apps/api/src/identity/identity.service';

const db = new PrismaClient();

async function runNegativeResilienceTests() {
  console.log('================================================================================');
  console.log('🛡️ MEMULAI PENGUJIAN KETAHANAN NEGATIF & ANTI-CRASH (ZERO-CRASH HARDENING) 🛡️');
  console.log('================================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    }
  }

  const idempotency = new IdempotencyService(db as any);
  const policy = new PolicyService(db as any);
  const rateLimit = new RateLimitService(db as any);
  const runtimeConfig = {
    value: {
      booking: { enabled: true, cutoffHours: 2 },
      reschedule: { enabled: true, cutoffHours: 24 },
      bookingCancellation: { enabled: true, cutoffHours: 24 },
    },
  } as any;

  const identityService = new IdentityService(
    db as any,
    policy,
    {} as any,
    {} as any,
    {} as any,
    rateLimit,
    {} as any,
  );
  const bookingsService = new BookingsService(db as any, idempotency, policy, runtimeConfig);
  const classSlotService = new ClassSlotService(db as any, policy, idempotency, runtimeConfig);

  // ---------------------------------------------------------------------------
  // TEST 1: Registrasi Duplikat Email (Harus 409 EMAIL_ALREADY_REGISTERED, Bukan 500)
  // ---------------------------------------------------------------------------
  console.log('--- 1. PENGUJIAN REGISTRASI DUPLIKAT EMAIL ---');
  const existingUser = await db.user.findFirst({
    where: { email: { not: null } },
  });
  if (!existingUser || !existingUser.email) {
    throw new Error('Database harus memiliki setidaknya satu user untuk pengujian duplikasi');
  }

  let errorEmailCaught: any = null;
  try {
    await identityService.registerCustomer({
      displayName: 'Duplicate Tester',
      email: existingUser.email,
      phone: `0899${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'SecurePassword123!',
      consent: true,
    });
  } catch (err: any) {
    errorEmailCaught = err;
  }

  assert(
    errorEmailCaught !== null &&
      errorEmailCaught.getStatus?.() === 409 &&
      errorEmailCaught.code === 'EMAIL_ALREADY_REGISTERED',
    'Registrasi dengan email terdaftar menghasilkan HTTP 409 (EMAIL_ALREADY_REGISTERED)',
    `Status: ${errorEmailCaught?.getStatus?.()}, Code: ${errorEmailCaught?.code}`,
  );

  // ---------------------------------------------------------------------------
  // TEST 2: Registrasi Duplikat Nomor HP (Harus 409 PHONE_ALREADY_REGISTERED, Bukan 500)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. PENGUJIAN REGISTRASI DUPLIKAT NOMOR HP ---');
  const existingPhoneUser = await db.user.findFirst({
    where: { phone: { not: null } },
  });

  let errorPhoneCaught: any = null;
  if (existingPhoneUser && existingPhoneUser.phone) {
    try {
      await identityService.registerCustomer({
        displayName: 'Duplicate Phone Tester',
        email: `unique_${Date.now()}@test.com`,
        phone: existingPhoneUser.phone,
        password: 'SecurePassword123!',
        consent: true,
      });
    } catch (err: any) {
      errorPhoneCaught = err;
    }

    assert(
      errorPhoneCaught !== null &&
        errorPhoneCaught.getStatus?.() === 409 &&
        errorPhoneCaught.code === 'PHONE_ALREADY_REGISTERED',
      'Registrasi dengan nomor HP terdaftar menghasilkan HTTP 409 (PHONE_ALREADY_REGISTERED)',
      `Status: ${errorPhoneCaught?.getStatus?.()}, Code: ${errorPhoneCaught?.code}`,
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 3: HTTP Endpoint Full Pipeline (Menembak Endpoint API /api/v1/auth/customer-registrations)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. PENGUJIAN HTTP NETWORK PIPELINE (Cek Zero 500 & HTTP 409) ---');
  try {
    const formData = new FormData();
    formData.append('displayName', 'HTTP Duplicate Test');
    formData.append('email', existingUser.email);
    formData.append('phone', '081299998888');
    formData.append('password', 'Password123!');
    formData.append('consent', 'true');
    formData.append('selfie', new Blob(['fake-selfie-data'], { type: 'image/jpeg' }), 'selfie.jpg');
    formData.append('ktp', new Blob(['fake-ktp-data'], { type: 'image/jpeg' }), 'ktp.jpg');

    const res = await fetch('http://127.0.0.1:32121/api/v1/auth/customer-registrations', {
      method: 'POST',
      body: formData,
    });

    const body: any = await res.json().catch(() => ({}));
    assert(
      res.status === 409 && body?.error?.code === 'EMAIL_ALREADY_REGISTERED',
      'HTTP POST /api/v1/auth/customer-registrations mengembalikan status 409 Conflict (EMAIL_ALREADY_REGISTERED)',
      `Menerima status ${res.status}: ${JSON.stringify(body)}`,
    );
    assert(
      res.status !== 500,
      'HTTP POST tidak menghasilkan error 500 Internal Server Error di server (Tuntas)',
    );
  } catch (err: any) {
    console.warn('⚠️ Server HTTP lokal port 32121 belum merespons:', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Validasi Integritas Booking - Modality / Jenis Kelas Mismatch
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. PENGUJIAN BOOKING PACKAGE MODALITY MISMATCH ---');
  const branch = await db.cabang.findFirst({ where: { active: true } });
  const classTypes = await db.jenisKelas.findMany({ take: 2 });
  const member = await db.user.findFirst({ where: { role: 'MEMBER', status: 'ACTIVE' } });

  if (branch && classTypes.length >= 2 && member) {
    const typeA = classTypes[0];
    const typeB = classTypes[1];

    // Buat paket khusus Type A
    const packageA = await db.paket.create({
      data: {
        id: randomUUID(),
        branchId: branch.id,
        classTypeId: typeA.id,
        code: `PKG-TEST-${Date.now().toString(36)}`,
        name: `Khusus ${typeA.name}`,
        sessionCount: 5,
        validityDays: 30,
        priceRp: 500_000,
        status: 'ACTIVE',
      },
    });

    // Berikan paket ke member
    const customerPkg = await db.paketPelanggan.create({
      data: {
        id: randomUUID(),
        userId: member.id,
        packageId: packageA.id,
        totalSessions: 5,
        remainingSessions: 5,
        usedSessions: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 86400000),
        status: 'ACTIVE',
      },
    });

    // Buat slot kelas untuk Type B (Modality berbeda)
    const instructor = await db.user.findFirst({ where: { role: 'INSTRUCTOR', status: 'ACTIVE' } });
    const studio = await db.studio.findFirst({ where: { branchId: branch.id, active: true } });

    if (instructor && studio) {
      const slotB = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branch.id,
          studioId: studio.id,
          classTypeId: typeB.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 48 * 3600000),
          endAt: new Date(Date.now() + 49 * 3600000),
          capacity: 5,
          bookedCount: 0,
          status: 'PUBLISHED',
        },
      });

      const memberPrincipal: SessionPrincipal = {
        userId: member.id,
        roles: [{ role: 'CUSTOMER', branchId: null }, { role: 'MEMBER', branchId: null }],
        branchIds: [branch.id],
        capabilities: ['booking:self:create', 'booking:self:read'],
      };

      let mismatchError: any = null;
      try {
        await bookingsService.create(
          memberPrincipal,
          {
            classSlotId: slotB.id,
            customerPackageId: customerPkg.id,
            source: 'SELF',
          },
          `test-key-${randomUUID()}`,
          'test-correlation',
        );
      } catch (err: any) {
        mismatchError = err;
      }

      assert(
        mismatchError !== null &&
          mismatchError.getStatus?.() === 409 &&
          mismatchError.code === 'PACKAGE_CLASS_TYPE_MISMATCH',
        'Booking ditolak dengan 409 PACKAGE_CLASS_TYPE_MISMATCH saat jenis kelas paket tidak cocok',
        `Status: ${mismatchError?.getStatus?.()}, Code: ${mismatchError?.code}`,
      );

      // Bersihkan data uji
      await db.slotKelas.delete({ where: { id: slotB.id } });
    }
    await db.paketPelanggan.delete({ where: { id: customerPkg.id } });
    await db.paket.delete({ where: { id: packageA.id } });
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Penegakan Kebijakan Sesi Mangkir (No-Show Forfeiture)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. PENGUJIAN SESI MANGKIR (NO-SHOW FORFEITURE) ---');
  if (branch && member) {
    const instructor = await db.user.findFirst({ where: { role: 'INSTRUCTOR', status: 'ACTIVE' } });
    const studio = await db.studio.findFirst({ where: { branchId: branch.id, active: true } });
    const classType = await db.jenisKelas.findFirst();

    if (instructor && studio && classType) {
      // Buat paket uji
      const testPkg = await db.paket.create({
        data: {
          id: randomUUID(),
          branchId: branch.id,
          classTypeId: classType.id,
          code: `PKG-NOSHOW-${Date.now().toString(36)}`,
          name: 'Paket No Show Test',
          sessionCount: 10,
          validityDays: 30,
          priceRp: 1_000_000,
          status: 'ACTIVE',
        },
      });

      const customerPkg = await db.paketPelanggan.create({
        data: {
          id: randomUUID(),
          userId: member.id,
          packageId: testPkg.id,
          totalSessions: 10,
          remainingSessions: 10,
          usedSessions: 0,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 86400000),
          status: 'ACTIVE',
        },
      });

      const slot = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branch.id,
          studioId: studio.id,
          classTypeId: classType.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() - 2 * 3600000), // Kelas sudah lewat 2 jam lalu
          endAt: new Date(Date.now() - 1 * 3600000),
          capacity: 5,
          bookedCount: 1,
          status: 'PUBLISHED',
        },
      });

      const booking = await db.pemesananKelas.create({
        data: {
          id: randomUUID(),
          bookingNumber: `BK-NOSHOW-${Date.now().toString(36)}`,
          classSlotId: slot.id,
          userId: member.id,
          customerPackageId: customerPkg.id,
          status: 'BOOKED', // Tidak pernah check-in (NO_SHOW)
        },
      });

      const admin = await db.user.findFirst({ where: { role: 'SUPERADMIN' } });
      const adminPrincipal: SessionPrincipal = {
        userId: admin?.id ?? randomUUID(),
        roles: [{ role: 'SUPERADMIN', branchId: null }],
        branchIds: [branch.id],
        capabilities: ['class:manage', 'class:write', 'branch:all'],
      };

      // Admin menyelesaikan kelas
      await classSlotService.complete(
        adminPrincipal,
        slot.id,
        `complete-${randomUUID()}`,
        'test-correlation',
      );

      // Cek apakah saldo berkurang dan mutasi tercatat
      const updatedPkg = await db.paketPelanggan.findUnique({
        where: { id: customerPkg.id },
      });
      const ledgerEntry = await db.sessionLedger.findFirst({
        where: {
          referenceId: booking.id,
          type: SessionMutationType.ATTEND,
        },
      });

      assert(
        updatedPkg?.remainingSessions === 9,
        'Saldo sesi member berkurang 1 meskipun status NO SHOW (hangus)',
        `Sisa sesi: ${updatedPkg?.remainingSessions}`,
      );
      assert(
        ledgerEntry !== null && ledgerEntry.notes?.includes('NO SHOW'),
        'SessionLedger mencatat mutasi pengurangan sesi dengan catatan NO SHOW',
        `Ledger notes: ${ledgerEntry?.notes}`,
      );

      // Bersihkan data uji
      await db.sessionLedger.deleteMany({ where: { referenceId: booking.id } });
      await db.pemesananKelas.delete({ where: { id: booking.id } });
      await db.slotKelas.delete({ where: { id: slot.id } });
      await db.paketPelanggan.delete({ where: { id: customerPkg.id } });
      await db.paket.delete({ where: { id: testPkg.id } });
    }
  }

  console.log('\n================================================================================');
  console.log(`📊 HASIL PENGUJIAN KETAHANAN: ${passed} / ${total} KASUS UJI LULUS (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================================\n');

  if (passed === total) {
    console.log('🎉 SELURUH PENGUJIAN KETAHANAN LULUS 100%! SISTEM KEBAL TERHADAP CRASH 500.');
  } else {
    console.error('⚠️ ADA KASUS UJI YANG GAGAL. SILAKAN PERIKSA DETAIL DI ATAS.');
    process.exit(1);
  }
}

runNegativeResilienceTests()
  .catch((e) => {
    console.error('CRITICAL TEST FAILURE:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
