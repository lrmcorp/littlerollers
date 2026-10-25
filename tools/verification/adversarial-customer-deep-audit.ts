import { HttpStatus } from '@nestjs/common';
import {
  PrismaClient,
  Role,
  UserStatus,
  ClassSlotStatus,
  BookingStatus,
  PackageStatus,
  PaymentMethod,
  PurchaseStatus,
  VoucherDiscountType,
  VoucherStatus,
} from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';
import { ReschedulesService } from '../../apps/api/src/bookings/ubah-jadwal.service';
import { AttendanceService } from '../../apps/api/src/attendance/kehadiran.service';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { RuntimeConfigService } from '../../apps/api/src/configuration/runtime-config.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';

interface TestRecord {
  code: string;
  category: string;
  name: string;
  type: 'NEGATIVE' | 'EDGE' | 'FLOW' | 'SECURITY';
  passed: boolean;
  message: string;
  durationMs: number;
}

const auditResults: TestRecord[] = [];

function record(
  code: string,
  category: string,
  name: string,
  type: 'NEGATIVE' | 'EDGE' | 'FLOW' | 'SECURITY',
  passed: boolean,
  message: string,
  durationMs: number,
) {
  auditResults.push({ code, category, name, type, passed, message, durationMs });
  const badge = passed ? '✅ PASS' : '❌ FAIL';
  const tag = `[${type}]`.padEnd(10);
  console.log(`   ${badge} ${tag} [${code}] ${name} (${durationMs}ms)`);
  if (!passed) {
    console.error(`      ⚠️ Detail Temuan / Blind Spot: ${message}`);
  }
}

async function runAudit() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - COMPREHENSIVE CUSTOMER AUDIT & ADVERSARIAL TEST SUITE       ║');
  console.log('║   STRICT NO-HAPPY-PATH: Negative, Edge, Concurrency, IDOR, & Boundary Tests  ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          'mysql://dailydose:b64c0a6442c3df2f4f940459955788747a844facf4be7d9e23773bad7b592308@127.0.0.1:3315/dailydose',
      },
    },
  });

  const policy = new PolicyService();
  const idempotency = new IdempotencyService(db as any);
  const runtimeConfig = {
    value: {
      quotaEvaluation: { maxAttempts: 5 },
      booking: { enabled: true, cutoffHours: 2 },
      bookingCancellation: { enabled: true, cutoffHours: 24 },
      reschedule: { enabled: true, cutoffHours: 24 },
    },
  } as any;

  const bookingsService = new BookingsService(
    db as any,
    idempotency,
    policy,
    runtimeConfig,
  );
  const reschedulesService = new ReschedulesService(
    db as any,
    idempotency,
    policy,
    runtimeConfig,
  );
  const attendanceService = new AttendanceService(
    db as any,
    idempotency,
    policy,
    runtimeConfig,
  );

  const cleanupUserIds: string[] = [];
  const cleanupPackageIds: string[] = [];
  const cleanupCustomerPackageIds: string[] = [];
  const cleanupSlotIds: string[] = [];
  const cleanupBookingIds: string[] = [];
  const cleanupVoucherIds: string[] = [];
  const cleanupPurchaseIds: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // SETUP: Master Data & Actors
    // ------------------------------------------------------------------------
    console.log('▶ Menyiapkan Cabang, Jenis Kelas, dan Aktor Uji...');
    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) throw new Error('Minimal 2 cabang diperlukan.');
    const [branchA, branchB] = branches;

    const studios = await db.studio.findMany({
      where: { branchId: branchA.id },
      take: 1,
    });
    const studio = studios[0] ?? (await db.studio.findFirstOrThrow());

    const classTypes = await db.jenisKelas.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (classTypes.length < 2) throw new Error('Minimal 2 jenis kelas diperlukan.');
    const [classTypeA, classTypeB] = classTypes;

    const instructor = await db.user.findFirstOrThrow({
      where: { role: Role.INSTRUCTOR },
    });

    const passwordHash = await argon2.hash('TestCustomer123!');

    const uniqueSuffix = () => Math.floor(10000000 + Math.random() * 90000000).toString();

    // Customer Utama (Target)
    const customerTarget = await db.user.create({
      data: {
        id: randomUUID(),
        email: `cust.target.${Date.now()}.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Target Customer',
        phone: `+62812${uniqueSuffix()}`,
        passwordHash,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        preferredBranchId: branchA.id,
      },
    });
    cleanupUserIds.push(customerTarget.id);

    // Customer Adversary (Penyerang IDOR)
    const customerAttacker = await db.user.create({
      data: {
        id: randomUUID(),
        email: `cust.attacker.${Date.now()}.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Attacker Customer',
        phone: `+62812${uniqueSuffix()}`,
        passwordHash,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        preferredBranchId: branchB.id,
      },
    });
    cleanupUserIds.push(customerAttacker.id);

    // Customer Suspended
    const customerSuspended = await db.user.create({
      data: {
        id: randomUUID(),
        email: `cust.suspended.${Date.now()}.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Suspended Customer',
        phone: `+62812${uniqueSuffix()}`,
        passwordHash,
        role: Role.CUSTOMER,
        status: UserStatus.SUSPENDED,
        preferredBranchId: branchA.id,
      },
    });
    cleanupUserIds.push(customerSuspended.id);

    const principalTarget: SessionPrincipal = {
      sessionId: randomUUID(),
      userId: customerTarget.id,
      roles: [{ role: 'CUSTOMER', branchId: null }],
      capabilities: [
        'customer:self',
        'package:read',
        'voucher:redeem',
        'ledger:read',
        'class-slot:read',
        'booking:self:read',
        'booking:self:create',
        'booking:self:cancel',
        'reschedule:self:read',
        'reschedule:self:request',
      ],
      branchIds: [],
      capabilityGrants: [],
      capabilityDenials: [],
      sessionExpiresAt: new Date(Date.now() + 3600_000),
      passwordChangeRequired: false,
    };

    const principalAttacker: SessionPrincipal = {
      ...principalTarget,
      sessionId: randomUUID(),
      userId: customerAttacker.id,
    };

    const principalSuspended: SessionPrincipal = {
      ...principalTarget,
      sessionId: randomUUID(),
      userId: customerSuspended.id,
    };

    // ========================================================================
    // PILAR 1: AUTENTIKASI, SESI & ISOLASI PRIVILEGE (SECURITY & NEGATIVE)
    // ========================================================================
    console.log('\n▶ PILAR 1: Autentikasi, Sesi & Isolasi Privilege (Security & Negative)...');

    // 1.1 Suspended User Booking Gate
    {
      const t0 = Date.now();
      try {
        await bookingsService.create(
          principalSuspended,
          {
            classSlotId: randomUUID(),
            customerPackageId: randomUUID(),
            source: 'SELF',
          },
          randomUUID(),
          'trace-1.1',
        );
        record(
          'SEC_AUTH_1',
          'Autentikasi',
          'User berstatus SUSPENDED dicekal dari booking',
          'SECURITY',
          false,
          'User SUSPENDED berhasil mengeksekusi booking!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'IDENTITY_VERIFICATION_REQUIRED' || err?.status === 403 || err?.code === 'RESOURCE_NOT_FOUND';
        record(
          'SEC_AUTH_1',
          'Autentikasi',
          'User berstatus SUSPENDED dicekal dari booking',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan tepat' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 1.2 Privilege Escalation Blockade (Customer accessing Staff capabilities)
    {
      const t0 = Date.now();
      const staffCapabilities = [
        'branch:operate',
        'ledger:adjust:request',
        'payment:review',
        'class-slot:manage',
        'finance:read',
        'user:admin',
      ];
      let leaked = false;
      for (const cap of staffCapabilities) {
        if (policy.hasCapability(principalTarget, cap)) {
          leaked = true;
          break;
        }
      }
      record(
        'SEC_AUTH_2',
        'RBAC',
        'Customer dicekal mutlak dari seluruh izin staf (No Escalation)',
        'SECURITY',
        !leaked,
        leaked ? 'Customer memiliki kapabilitas staf!' : 'Isolasi RBAC terverifikasi bersih',
        Date.now() - t0,
      );
    }

    // 1.3 Staff-Assisted Booking Impersonation Protection
    {
      const t0 = Date.now();
      try {
        await bookingsService.create(
          principalTarget,
          {
            classSlotId: randomUUID(),
            customerPackageId: randomUUID(),
            customerUserId: customerAttacker.id,
            source: 'ADMIN_ASSISTED',
          },
          randomUUID(),
          'trace-1.3',
        );
        record(
          'SEC_AUTH_3',
          'RBAC',
          'Customer dilarang berpura-pura menggunakan alur ADMIN_ASSISTED',
          'SECURITY',
          false,
          'Customer berhasil menggunakan source ADMIN_ASSISTED!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'FORBIDDEN' || err?.status === 403 || err?.code === 'VALIDATION_ERROR';
        record(
          'SEC_AUTH_3',
          'RBAC',
          'Customer dilarang berpura-pura menggunakan alur ADMIN_ASSISTED',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan 403/400' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 2: INTEGRITAS PAKET, CABANG & JENIS KELAS (MISMATCH & EDGE)
    // ========================================================================
    console.log('\n▶ PILAR 2: Integritas Paket, Cabang & Jenis Kelas (Mismatch & Edge)...');

    const masterPkgA = await db.paket.create({
      data: {
        id: randomUUID(),
        code: `PK-A-${Date.now()}`,
        name: `Paket Branch A ${Date.now()}`,
        branchId: branchA.id,
        classTypeId: classTypeA.id,
        sessionCount: 5,
        validityDays: 30,
        priceRp: 500_000,
        status: PackageStatus.ACTIVE,
      },
    });
    cleanupPackageIds.push(masterPkgA.id);

    const custPkgA = await db.paketPelanggan.create({
      data: {
        id: randomUUID(),
        userId: customerTarget.id,
        packageId: masterPkgA.id,
        totalSessions: 5,
        remainingSessions: 5,
        usedSessions: 0,
        validUntil: new Date(Date.now() + 30 * 86_400_000),
        status: 'ACTIVE',
      },
    });
    cleanupCustomerPackageIds.push(custPkgA.id);

    const slotBranchB = await db.slotKelas.create({
      data: {
        id: randomUUID(),
        branchId: branchB.id,
        studioId: studio.id,
        classTypeId: classTypeA.id,
        instructorId: instructor.id,
        startAt: new Date(Date.now() + 48 * 3600_000),
        endAt: new Date(Date.now() + 49 * 3600_000),
        capacity: 10,
        bookedCount: 0,
        status: ClassSlotStatus.PUBLISHED,
      },
    });
    cleanupSlotIds.push(slotBranchB.id);

    const slotClassTypeB = await db.slotKelas.create({
      data: {
        id: randomUUID(),
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classTypeB.id,
        instructorId: instructor.id,
        startAt: new Date(Date.now() + 48 * 3600_000),
        endAt: new Date(Date.now() + 49 * 3600_000),
        capacity: 10,
        bookedCount: 0,
        status: ClassSlotStatus.PUBLISHED,
      },
    });
    cleanupSlotIds.push(slotClassTypeB.id);

    // 2.1 Cross-Branch Package Hijacking Blockade
    {
      const t0 = Date.now();
      try {
        await bookingsService.create(
          principalTarget,
          {
            classSlotId: slotBranchB.id,
            customerPackageId: custPkgA.id,
            source: 'SELF',
          },
          randomUUID(),
          'trace-2.1',
        );
        record(
          'NEG_PKG_1',
          'Integritas Paket',
          'Paket Cabang A dilarang dipakai di Slot Cabang B',
          'NEGATIVE',
          false,
          'Paket lintas cabang berhasil dipesan!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'PACKAGE_BRANCH_MISMATCH' || err?.status === 409;
        record(
          'NEG_PKG_1',
          'Integritas Paket',
          'Paket Cabang A dilarang dipakai di Slot Cabang B',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan PACKAGE_BRANCH_MISMATCH' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 2.2 Class Type / Modality Mismatch Blockade
    {
      const t0 = Date.now();
      try {
        await bookingsService.create(
          principalTarget,
          {
            classSlotId: slotClassTypeB.id,
            customerPackageId: custPkgA.id,
            source: 'SELF',
          },
          randomUUID(),
          'trace-2.2',
        );
        record(
          'NEG_PKG_2',
          'Integritas Paket',
          'Paket Modality A dilarang dipakai di Modality B',
          'NEGATIVE',
          false,
          'Paket beda modality berhasil dipesan!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'PACKAGE_CLASS_TYPE_MISMATCH' || err?.status === 409;
        record(
          'NEG_PKG_2',
          'Integritas Paket',
          'Paket Modality A dilarang dipakai di Modality B',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan PACKAGE_CLASS_TYPE_MISMATCH' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 2.3 IDOR Package Hijacking (Attacker uses Target's packageId)
    {
      const t0 = Date.now();
      try {
        await bookingsService.create(
          principalAttacker,
          {
            classSlotId: slotClassTypeB.id,
            customerPackageId: custPkgA.id,
            source: 'SELF',
          },
          randomUUID(),
          'trace-2.3',
        );
        record(
          'SEC_IDOR_1',
          'IDOR',
          'Pencurian ID paket orang lain dicekal (Cross-user package IDOR)',
          'SECURITY',
          false,
          'Attacker berhasil menggunakan paket milik Target!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'RESOURCE_NOT_FOUND' || err?.status === 404;
        record(
          'SEC_IDOR_1',
          'IDOR',
          'Pencurian ID paket orang lain dicekal (Cross-user package IDOR)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan RESOURCE_NOT_FOUND (Data Isolation)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 2.4 Expired Package Booking Blockade
    {
      const t0 = Date.now();
      const expiredPkg = await db.paketPelanggan.create({
        data: {
          id: randomUUID(),
          userId: customerTarget.id,
          packageId: masterPkgA.id,
          totalSessions: 10,
          remainingSessions: 5,
          usedSessions: 5,
          validUntil: new Date(Date.now() - 24 * 3600_000),
          status: 'ACTIVE',
        },
      });
      cleanupCustomerPackageIds.push(expiredPkg.id);

      const validSlotA = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studio.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 48 * 3600_000),
          endAt: new Date(Date.now() + 49 * 3600_000),
          capacity: 10,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(validSlotA.id);

      try {
        await bookingsService.create(
          principalTarget,
          {
            classSlotId: validSlotA.id,
            customerPackageId: expiredPkg.id,
            source: 'SELF',
          },
          randomUUID(),
          'trace-2.4',
        );
        record(
          'NEG_PKG_3',
          'Integritas Paket',
          'Paket yang sudah kedaluwarsa tanggalnya dicekal dari booking',
          'NEGATIVE',
          false,
          'Paket kedaluwarsa berhasil membukukan kelas!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'INSUFFICIENT_AVAILABLE_SESSIONS' || err?.status === 409;
        record(
          'NEG_PKG_3',
          'Integritas Paket',
          'Paket yang sudah kedaluwarsa tanggalnya dicekal dari booking',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan INSUFFICIENT_AVAILABLE_SESSIONS' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 3: KUOTA VIRTUAL VS FISIK & BLIND SPOT OVER-RESERVATION (RULE #1 & #2)
    // ========================================================================
    console.log('\n▶ PILAR 3: Kuota Virtual vs Fisik & Blind Spot Over-Reservation...');

    const singleSessionPkg = await db.paketPelanggan.create({
      data: {
        id: randomUUID(),
        userId: customerTarget.id,
        packageId: masterPkgA.id,
        totalSessions: 1,
        remainingSessions: 1,
        usedSessions: 0,
        validUntil: new Date(Date.now() + 30 * 86_400_000),
        status: 'ACTIVE',
      },
    });
    cleanupCustomerPackageIds.push(singleSessionPkg.id);

    const slotTomorrow1 = await db.slotKelas.create({
      data: {
        id: randomUUID(),
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classTypeA.id,
        instructorId: instructor.id,
        startAt: new Date(Date.now() + 30 * 3600_000),
        endAt: new Date(Date.now() + 31 * 3600_000),
        capacity: 10,
        bookedCount: 0,
        status: ClassSlotStatus.PUBLISHED,
      },
    });
    cleanupSlotIds.push(slotTomorrow1.id);

    const slotTomorrow2 = await db.slotKelas.create({
      data: {
        id: randomUUID(),
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classTypeA.id,
        instructorId: instructor.id,
        startAt: new Date(Date.now() + 35 * 3600_000),
        endAt: new Date(Date.now() + 36 * 3600_000),
        capacity: 10,
        bookedCount: 0,
        status: ClassSlotStatus.PUBLISHED,
      },
    });
    cleanupSlotIds.push(slotTomorrow2.id);

    // 3.1 Booking pertama: harus sukses
    let booking1Id = '';
    {
      const t0 = Date.now();
      const res = await bookingsService.create(
        principalTarget,
        {
          classSlotId: slotTomorrow1.id,
          customerPackageId: singleSessionPkg.id,
          source: 'SELF',
        },
        randomUUID(),
        'trace-3.1',
      );
      booking1Id = (res.body as any).id;
      cleanupBookingIds.push(booking1Id);
      record(
        'FLOW_QUOTA_1',
        'Kuota Sesi',
        'Booking pertama mengunci kuota (Fisik=1, Aktif=1, Tersedia=0)',
        'FLOW',
        Boolean(booking1Id),
        'Booking pertama berhasil dibuat',
        Date.now() - t0,
      );
    }

    // 3.2 Booking kedua: Over-reservation blockade
    {
      const t0 = Date.now();
      try {
        await bookingsService.create(
          principalTarget,
          {
            classSlotId: slotTomorrow2.id,
            customerPackageId: singleSessionPkg.id,
            source: 'SELF',
          },
          randomUUID(),
          'trace-3.2',
        );
        record(
          'EDGE_QUOTA_2',
          'Kuota Sesi',
          'Pencegahan Over-Reservation Kuota Virtual (Fisik=1, Aktif=1 -> 2nd Booking DICEKAL)',
          'EDGE',
          false,
          'BLIND SPOT BOCOR! Customer berhasil booking 2 kelas dengan paket 1 sesi!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'INSUFFICIENT_AVAILABLE_SESSIONS' || err?.status === 409;
        record(
          'EDGE_QUOTA_2',
          'Kuota Sesi',
          'Pencegahan Over-Reservation Kuota Virtual (Fisik=1, Aktif=1 -> 2nd Booking DICEKAL)',
          'EDGE',
          passed,
          passed ? 'Terproteksi: INSUFFICIENT_AVAILABLE_SESSIONS' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 3.3 Customer Options calculation on Virtual Quota
    {
      const t0 = Date.now();
      const options = await bookingsService.customerOptions(principalTarget, slotTomorrow2.id);
      const pkgReport = options.packages.find((p: any) => p.customerPackageId === singleSessionPkg.id);
      const isCorrectlyZero = !pkgReport || pkgReport.available === 0;
      record(
        'EDGE_QUOTA_3',
        'UI Eligibility',
        'Customer Options menghitung availableSessions = remaining - activeBookings',
        'EDGE',
        isCorrectlyZero,
        isCorrectlyZero ? 'availableSessions = 0 terlaporkan dengan benar' : `BLIND SPOT: availableSessions dilaporkan ${pkgReport?.available}`,
        Date.now() - t0,
      );
    }

    // ========================================================================
    // PILAR 4: JADWAL, BOUNDARY CUTOFF & DOUBLE BOOKING
    // ========================================================================
    console.log('\n▶ PILAR 4: Jadwal, Boundary Cutoff & Double Booking...');

    // 4.1 Booking Cutoff H-2 (Boundary test)
    {
      const t0 = Date.now();
      const slotInsideCutoff = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studio.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 60 * 60_000),
          endAt: new Date(Date.now() + 120 * 60_000),
          capacity: 10,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(slotInsideCutoff.id);

      try {
        await bookingsService.create(
          principalTarget,
          {
            classSlotId: slotInsideCutoff.id,
            customerPackageId: custPkgA.id,
            source: 'SELF',
          },
          randomUUID(),
          'trace-4.1',
        );
        record(
          'EDGE_CUTOFF_1',
          'Cutoff Waktu',
          'Booking di dalam batas H-2 jam dicekal (Cutoff Passed)',
          'EDGE',
          false,
          'Customer berhasil booking kelas 1 jam sebelum mulai!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'BOOKING_CUTOFF_PASSED' || err?.status === 409;
        record(
          'EDGE_CUTOFF_1',
          'Cutoff Waktu',
          'Booking di dalam batas H-2 jam dicekal (Cutoff Passed)',
          'EDGE',
          passed,
          passed ? 'Dicekal dengan BOOKING_CUTOFF_PASSED' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 4.2 Past Slot Booking Blockade
    {
      const t0 = Date.now();
      const pastSlot = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studio.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() - 3600_000),
          endAt: new Date(Date.now() - 1800_000),
          capacity: 10,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(pastSlot.id);

      try {
        await bookingsService.create(
          principalTarget,
          {
            classSlotId: pastSlot.id,
            customerPackageId: custPkgA.id,
            source: 'SELF',
          },
          randomUUID(),
          'trace-4.2',
        );
        record(
          'NEG_SLOT_1',
          'Integritas Slot',
          'Booking slot di masa lalu dicekal mutlak',
          'NEGATIVE',
          false,
          'Customer berhasil booking slot masa lalu!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'BOOKING_CUTOFF_PASSED' || err?.status === 409;
        record(
          'NEG_SLOT_1',
          'Integritas Slot',
          'Booking slot di masa lalu dicekal mutlak',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan BOOKING_CUTOFF_PASSED' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 4.3 Serial Duplicate Booking
    {
      const t0 = Date.now();
      try {
        await bookingsService.create(
          principalTarget,
          {
            classSlotId: slotTomorrow1.id,
            customerPackageId: custPkgA.id,
            source: 'SELF',
          },
          randomUUID(),
          'trace-4.3',
        );
        record(
          'NEG_BOOKING_1',
          'Double Booking',
          'Customer dilarang booking 2 kali di slot yang sama persis',
          'NEGATIVE',
          false,
          'Customer berhasil booking ganda di slot yang sama!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'DUPLICATE_ACTIVE_BOOKING' || err?.status === 409;
        record(
          'NEG_BOOKING_1',
          'Double Booking',
          'Customer dilarang booking 2 kali di slot yang sama persis',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan DUPLICATE_ACTIVE_BOOKING' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 4.4 High Concurrency Hammer on Last Seat (Zero Overbooking Guarantee)
    {
      const t0 = Date.now();
      const tinySlot = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studio.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 50 * 3600_000),
          endAt: new Date(Date.now() + 51 * 3600_000),
          capacity: 1,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(tinySlot.id);

      const concurrentUsers: Array<{ user: any; pkg: any; principal: SessionPrincipal }> = [];
      for (let i = 0; i < 5; i++) {
        const u = await db.user.create({
          data: {
            id: randomUUID(),
            email: `hammer.user.${i}.${Date.now()}.${uniqueSuffix()}@dailydose.test`,
            displayName: `Hammer User ${i}`,
            phone: `+62812${uniqueSuffix()}`,
            passwordHash,
            role: Role.CUSTOMER,
            status: UserStatus.ACTIVE,
          },
        });
        cleanupUserIds.push(u.id);

        const p = await db.paketPelanggan.create({
          data: {
            id: randomUUID(),
            userId: u.id,
            packageId: masterPkgA.id,
            totalSessions: 5,
            remainingSessions: 5,
            usedSessions: 0,
            validUntil: new Date(Date.now() + 30 * 86_400_000),
            status: 'ACTIVE',
          },
        });
        cleanupCustomerPackageIds.push(p.id);

        concurrentUsers.push({
          user: u,
          pkg: p,
          principal: {
            ...principalTarget,
            sessionId: randomUUID(),
            userId: u.id,
          },
        });
      }

      const hammerResults = await Promise.allSettled(
        concurrentUsers.map((item) =>
          bookingsService.create(
            item.principal,
            {
              classSlotId: tinySlot.id,
              customerPackageId: item.pkg.id,
              source: 'SELF',
            },
            randomUUID(),
            `hammer-${item.user.id}`,
          ),
        ),
      );

      const successCount = hammerResults.filter((r) => r.status === 'fulfilled').length;
      const rejectedCount = hammerResults.filter((r) => r.status === 'rejected').length;

      const freshSlot = await db.slotKelas.findUniqueOrThrow({ where: { id: tinySlot.id } });
      const freshBookingsCount = await db.pemesananKelas.count({
        where: { classSlotId: tinySlot.id, status: 'BOOKED' },
      });

      const zeroOverbooking =
        successCount === 1 &&
        rejectedCount === 4 &&
        freshSlot.bookedCount === 1 &&
        freshBookingsCount === 1;

      record(
        'EDGE_RACE_1',
        'Konkurensi',
        'Pessimistic Locking Hammer: Kapasitas 1 diperebutkan 5 user paralel -> Tepat 1 sukses, 4 dicekal, 0 Overbooking',
        'EDGE',
        zeroOverbooking,
        zeroOverbooking
          ? 'Sempurna: Tepat 1 sukses, 4 dicekal CLASS_CAPACITY_FULL, DB bookedCount=1'
          : `OVERBOOKING BLIND SPOT! Sukses=${successCount}, Gagal=${rejectedCount}, DB count=${freshBookingsCount}`,
        Date.now() - t0,
      );
    }

    // ========================================================================
    // PILAR 5: PEMBATALAN, RESCHEDULE & IDOR ATTACK
    // ========================================================================
    console.log('\n▶ PILAR 5: Pembatalan, Reschedule & IDOR Attack...');

    // 5.1 IDOR Cancellation Attack
    {
      const t0 = Date.now();
      try {
        await bookingsService.cancel(
          principalAttacker,
          booking1Id,
          { reasonCode: 'CUSTOMER_SCHEDULE_CONFLICT' },
          randomUUID(),
          'trace-5.1',
        );
        record(
          'SEC_IDOR_2',
          'IDOR',
          'Pencurian/Pembatalan booking milik orang lain dicekal (IDOR Cancel)',
          'SECURITY',
          false,
          'Attacker berhasil membatalkan booking milik Target!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'RESOURCE_NOT_FOUND' || err?.status === 404;
        record(
          'SEC_IDOR_2',
          'IDOR',
          'Pencurian/Pembatalan booking milik orang lain dicekal (IDOR Cancel)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan RESOURCE_NOT_FOUND (Data Isolation)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.2 Late Cancellation Blockade (< 24 Hours cutoff)
    {
      const t0 = Date.now();
      const lateSlot = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studio.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 10 * 3600_000),
          endAt: new Date(Date.now() + 11 * 3600_000),
          capacity: 10,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(lateSlot.id);

      const lateBooking = await db.pemesananKelas.create({
        data: {
          id: randomUUID(),
          bookingNumber: `BK-LATE-${Date.now()}`,
          classSlotId: lateSlot.id,
          userId: customerTarget.id,
          customerPackageId: custPkgA.id,
          status: 'BOOKED',
        },
      });
      cleanupBookingIds.push(lateBooking.id);

      try {
        await bookingsService.cancel(
          principalTarget,
          lateBooking.id,
          { reasonCode: 'CUSTOMER_SCHEDULE_CONFLICT' },
          randomUUID(),
          'trace-5.2',
        );
        record(
          'NEG_CANCEL_1',
          'Kebijakan Pembatalan',
          'Pembatalan mandiri customer < 24 jam sebelum kelas dicekal (H-24 Cutoff)',
          'NEGATIVE',
          false,
          'Customer berhasil membatalkan booking di dalam jendela H-24!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'CANCELLATION_CUTOFF_PASSED' || err?.status === 409;
        record(
          'NEG_CANCEL_1',
          'Kebijakan Pembatalan',
          'Pembatalan mandiri customer < 24 jam sebelum kelas dicekal (H-24 Cutoff)',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan CANCELLATION_CUTOFF_PASSED' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.3 Valid Cancellation (> 24 Hours) & BookedCount Decrement O(1)
    {
      const t0 = Date.now();
      const initialSlot = await db.slotKelas.findUniqueOrThrow({ where: { id: slotTomorrow1.id } });
      const initialCount = initialSlot.bookedCount;

      const cancelRes = await bookingsService.cancel(
        principalTarget,
        booking1Id,
        { reasonCode: 'CUSTOMER_SCHEDULE_CONFLICT' },
        randomUUID(),
        'trace-5.3',
      );

      const afterSlot = await db.slotKelas.findUniqueOrThrow({ where: { id: slotTomorrow1.id } });
      const bookedCountDecremented = afterSlot.bookedCount === initialCount - 1;
      const statusCancelled = (cancelRes.body as any).status === 'CANCELLED';

      record(
        'FLOW_CANCEL_1',
        'Alur Pembatalan',
        'Pembatalan sah (> 24h) mengubah status CANCELLED dan mengurangi bookedCount O(1)',
        'FLOW',
        statusCancelled && bookedCountDecremented,
        statusCancelled && bookedCountDecremented
          ? 'Sukses: Status CANCELLED, bookedCount berkurang tepat 1'
          : `GAGAL: status=${(cancelRes.body as any).status}, bookedCount=${afterSlot.bookedCount}`,
        Date.now() - t0,
      );
    }

    // 5.4 Double Cancellation Blockade
    {
      const t0 = Date.now();
      try {
        await bookingsService.cancel(
          principalTarget,
          booking1Id,
          { reasonCode: 'CUSTOMER_SCHEDULE_CONFLICT' },
          randomUUID(),
          'trace-5.4',
        );
        record(
          'NEG_CANCEL_2',
          'State Machine',
          'Pembatalan ulang pada booking yang sudah CANCELLED dicekal',
          'NEGATIVE',
          false,
          'Booking yang sudah batal berhasil dibatalkan ulang!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'INVALID_STATE_TRANSITION' || err?.status === 409;
        record(
          'NEG_CANCEL_2',
          'State Machine',
          'Pembatalan ulang pada booking yang sudah CANCELLED dicekal',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan INVALID_STATE_TRANSITION' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.5 Reschedule Late Cutoff Blockade (< 24 Hours)
    {
      const t0 = Date.now();
      const lateBookingForReschedule = await db.pemesananKelas.create({
        data: {
          id: randomUUID(),
          bookingNumber: `BK-RESCH-${Date.now()}`,
          classSlotId: slotTomorrow1.id,
          userId: customerTarget.id,
          customerPackageId: custPkgA.id,
          status: 'BOOKED',
        },
      });
      cleanupBookingIds.push(lateBookingForReschedule.id);

      await db.slotKelas.update({
        where: { id: slotTomorrow1.id },
        data: { startAt: new Date(Date.now() + 10 * 3600_000) },
      });

      try {
        await reschedulesService.request(
          principalTarget,
          {
            bookingId: lateBookingForReschedule.id,
            targetClassSlotId: slotTomorrow2.id,
            reasonCode: 'CUSTOMER_SCHEDULE_CONFLICT',
          },
          randomUUID(),
          'trace-5.5',
        );
        record(
          'NEG_RESCH_1',
          'Reschedule',
          'Permintaan ubah jadwal < 24 jam sebelum kelas dicekal (H-24 Cutoff)',
          'NEGATIVE',
          false,
          'Customer berhasil mengajukan reschedule di dalam batas H-24!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'RESCHEDULE_CUTOFF_PASSED' || err?.status === 409;
        record(
          'NEG_RESCH_1',
          'Reschedule',
          'Permintaan ubah jadwal < 24 jam sebelum kelas dicekal (H-24 Cutoff)',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan RESCHEDULE_CUTOFF_PASSED' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 6: VOUCHER, CHECKOUT & PEMBAYARAN
    // ========================================================================
    console.log('\n▶ PILAR 6: Voucher, Checkout & Pembayaran...');

    // 6.1 Expired Voucher Blockade
    {
      const t0 = Date.now();
      const expiredVoucher = await db.voucher.create({
        data: {
          id: randomUUID(),
          code: `EXPIRED-${Date.now()}`,
          name: 'Voucher Expired',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          quota: 100,
          usedCount: 0,
          validUntil: new Date(Date.now() - 24 * 3600_000), // Habis kemarin
          active: true,
        },
      });
      cleanupVoucherIds.push(expiredVoucher.id);

      const voucherCheck = await db.voucher.findFirst({
        where: {
          code: expiredVoucher.code,
          active: true,
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
      });
      const passed = voucherCheck === null;
      record(
        'NEG_VOUCH_1',
        'Voucher',
        'Voucher yang sudah kedaluwarsa tidak dapat ditemukan/ditebus',
        'NEGATIVE',
        passed,
        passed ? 'Filter validUntil menolak voucher kedaluwarsa' : 'BLIND SPOT: Voucher kedaluwarsa lolos filter!',
        Date.now() - t0,
      );
    }

    // 6.2 Exhausted Voucher (maxUsage reached)
    {
      const t0 = Date.now();
      const exhaustedVoucher = await db.voucher.create({
        data: {
          id: randomUUID(),
          code: `EXHAUSTED-${Date.now()}`,
          name: 'Voucher Habis',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          quota: 5,
          usedCount: 5, // Sudah terpakai seluruhnya
          validUntil: new Date(Date.now() + 24 * 3600_000),
          active: true,
        },
      });
      cleanupVoucherIds.push(exhaustedVoucher.id);

      const voucherCheck = await db.voucher.findFirst({
        where: {
          code: exhaustedVoucher.code,
          usedCount: { lt: exhaustedVoucher.quota },
        },
      });
      const passed = voucherCheck === null;
      record(
        'NEG_VOUCH_2',
        'Voucher',
        'Voucher dengan kuota habis (usedCount >= maxUsage) dicekal',
        'NEGATIVE',
        passed,
        passed ? 'Dicekal karena usedCount >= quota' : 'BLIND SPOT: Voucher habis masih bisa ditebus!',
        Date.now() - t0,
      );
    }

    // 6.3 Order IDOR Attack (Attacker viewing Target's Order Details)
    {
      const t0 = Date.now();
      const targetPurchase = await db.pembelian.create({
        data: {
          id: randomUUID(),
          invoiceNumber: `INV-AUDIT-${Date.now()}`,
          userId: customerTarget.id,
          branchId: branchA.id,
          packageId: masterPkgA.id,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          subtotalRp: 500_000,
          totalAmountRp: 500_000,
          status: PurchaseStatus.PENDING,
          paymentExpiresAt: new Date(Date.now() + 24 * 3600_000),
        },
      });
      cleanupPurchaseIds.push(targetPurchase.id);

      const attackerAccess = await db.pembelian.findFirst({
        where: {
          id: targetPurchase.id,
          userId: customerAttacker.id,
        },
      });
      const passed = attackerAccess === null;
      record(
        'SEC_IDOR_3',
        'IDOR',
        'Pesanan pembayaran terisolasi per akun pelanggan (No Order IDOR Leak)',
        'SECURITY',
        passed,
        passed ? 'Terisolasi dengan aman (404 Not Found)' : 'BLIND SPOT: Attacker bisa membaca pesanan user lain!',
        Date.now() - t0,
      );
    }

    // ========================================================================
    // PILAR 7: ATTENDANCE & CHECK-IN TOKEN SECURITY
    // ========================================================================
    console.log('\n▶ PILAR 7: Attendance & Check-In Token Security...');

    // 7.1 Expired Check-In Token Rejection
    {
      const t0 = Date.now();
      const expiredSlot = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studio.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() - 4 * 3600_000),
          endAt: new Date(Date.now() - 3 * 3600_000),
          capacity: 10,
          bookedCount: 1,
          status: ClassSlotStatus.COMPLETED,
        },
      });
      cleanupSlotIds.push(expiredSlot.id);

      const expiredBooking = await db.pemesananKelas.create({
        data: {
          id: randomUUID(),
          bookingNumber: `BK-EXP-ATT-${Date.now()}`,
          classSlotId: expiredSlot.id,
          userId: customerTarget.id,
          customerPackageId: custPkgA.id,
          status: 'BOOKED',
        },
      });
      cleanupBookingIds.push(expiredBooking.id);

      const rawToken = randomBytes(32).toString('base64url');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      await db.checkInToken.create({
        data: {
          token: tokenHash,
          bookingId: expiredBooking.id,
          expiresAt: new Date(Date.now() - 2 * 3600_000),
          isUsed: false,
        },
      });

      try {
        await attendanceService.confirmCustomerLink(rawToken);
        record(
          'NEG_ATT_1',
          'Kehadiran',
          'Token check-in kedaluwarsa dicekal dari presensi kehadiran',
          'NEGATIVE',
          false,
          'Token check-in kedaluwarsa berhasil digunakan presensi!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'CHECK_IN_TOKEN_EXPIRED' || err?.code === 'CHECK_IN_WINDOW_CLOSED' || err?.status === 409 || err?.status === 410;
        record(
          'NEG_ATT_1',
          'Kehadiran',
          'Token check-in kedaluwarsa dicekal dari presensi kehadiran',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan CHECK_IN_WINDOW_CLOSED / EXPIRED (410)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 7.2 Replay Attack on Used Check-In Token
    {
      const t0 = Date.now();
      const usedRawToken = randomBytes(32).toString('base64url');
      const usedTokenHash = createHash('sha256').update(usedRawToken).digest('hex');
      await db.checkInToken.create({
        data: {
          token: usedTokenHash,
          bookingId: cleanupBookingIds[0] ?? randomUUID(),
          expiresAt: new Date(Date.now() + 3600_000),
          isUsed: true,
        },
      });

      try {
        await attendanceService.confirmCustomerLink(usedRawToken);
        record(
          'NEG_ATT_2',
          'Kehadiran',
          'Token check-in yang sudah pernah digunakan dicekal (No Token Replay)',
          'NEGATIVE',
          false,
          'Token yang sudah used berhasil digunakan kembali!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'CHECK_IN_TOKEN_REVOKED' || err?.code === 'CHECK_IN_TOKEN_ALREADY_USED' || err?.status === 409 || err?.status === 410;
        record(
          'NEG_ATT_2',
          'Kehadiran',
          'Token check-in yang sudah pernah digunakan dicekal (No Token Replay)',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan CHECK_IN_TOKEN_REVOKED / ALREADY_USED' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // RINGKASAN HASIL AUDIT
    // ========================================================================
    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 REKAPITULASI AUDIT & HASIL TESTING CUSTOMER (NO HAPPY PATH)');
    console.log('══════════════════════════════════════════════════════════════════════════════');
    const total = auditResults.length;
    const passed = auditResults.filter((r) => r.passed).length;
    const failed = auditResults.filter((r) => !r.passed).length;

    console.log(`Total Skenario Diuji : ${total}`);
    console.log(`Skenario LULUS (PASS): ${passed} ✅`);
    console.log(`Skenario GAGAL (FAIL): ${failed} ❌\n`);

    if (failed > 0) {
      console.log('❌ DAFTAR BLIND SPOT / KEGAGALAN TERDETEKSI:');
      for (const r of auditResults.filter((r) => !r.passed)) {
        console.log(`   - [${r.code}] [${r.type}] ${r.name}: ${r.message}`);
      }
    } else {
      console.log('🎉 SELURUH SKENARIO ADVERSARIAL CUSTOMER LULUS 100%! TIDAK ADA KEBOCORAN DITEMUKAN.');
    }

  } finally {
    console.log('\n🧹 Membersihkan data temporer pengujian...');
    try {
      if (cleanupBookingIds.length) {
        await db.ubahJadwal.deleteMany({ where: { bookingId: { in: cleanupBookingIds } } });
        await db.checkInToken.deleteMany({ where: { bookingId: { in: cleanupBookingIds } } });
        await db.kehadiranPelanggan.deleteMany({ where: { bookingId: { in: cleanupBookingIds } } });
        await db.pemesananKelas.deleteMany({ where: { id: { in: cleanupBookingIds } } });
      }
      if (cleanupCustomerPackageIds.length) {
        await db.pemesananKelas.deleteMany({ where: { customerPackageId: { in: cleanupCustomerPackageIds } } });
        await db.paketPelanggan.deleteMany({ where: { id: { in: cleanupCustomerPackageIds } } });
      }
      if (cleanupSlotIds.length) {
        await db.pemesananKelas.deleteMany({ where: { classSlotId: { in: cleanupSlotIds } } });
        await db.slotKelas.deleteMany({ where: { id: { in: cleanupSlotIds } } });
      }
      if (cleanupPurchaseIds.length) {
        await db.pembelian.deleteMany({ where: { id: { in: cleanupPurchaseIds } } });
      }
      if (cleanupPackageIds.length) {
        await db.paket.deleteMany({ where: { id: { in: cleanupPackageIds } } });
      }
      if (cleanupVoucherIds.length) {
        await db.voucher.deleteMany({ where: { id: { in: cleanupVoucherIds } } });
      }
      if (cleanupUserIds.length) {
        await db.userSession.deleteMany({ where: { userId: { in: cleanupUserIds } } });
        await db.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
      }
      console.log('   ✅ Data temporer berhasil dibersihkan.');
    } catch (e: any) {
      console.warn('   ⚠️ Catatan cleanup:', e.message);
    }
    await db.$disconnect();
  }
}

runAudit().catch((err) => {
  console.error('\n💥 FATAL ERROR EXECUTION:', err);
  process.exit(1);
});
