import {
  PrismaClient,
  Role,
  UserStatus,
  ClassSlotStatus,
  PurchaseStatus,
  PaymentMethod,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { AuditService } from '../../apps/api/src/foundation/audit.service';
import { AccessManagementService } from '../../apps/api/src/identity/access-management.service';
import { ClassSlotService } from '../../apps/api/src/classes/slot-kelas.service';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';
import { AttendanceService } from '../../apps/api/src/attendance/kehadiran.service';
import { PaymentReviewService } from '../../apps/api/src/packages/verifikasi-pembayaran.service';
import { LedgerService } from '../../apps/api/src/packages/ledger.service';
import { PackageAccessService } from '../../apps/api/src/packages/package-access.service';
import { FinanceService } from '../../apps/api/src/packages/finance.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';

interface AuditResult {
  code: string;
  pillar: string;
  name: string;
  type: 'NEGATIVE' | 'EDGE' | 'SECURITY' | 'FLOW';
  passed: boolean;
  message: string;
  durationMs: number;
}

const auditResults: AuditResult[] = [];

function record(
  code: string,
  pillar: string,
  name: string,
  type: 'NEGATIVE' | 'EDGE' | 'SECURITY' | 'FLOW',
  passed: boolean,
  message: string,
  durationMs: number,
) {
  auditResults.push({ code, pillar, name, type, passed, message, durationMs });
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`   ${statusIcon} [${type.padEnd(8)}] [${code}] ${name} (${durationMs}ms)`);
  if (!passed) {
    console.error(`      ⚠️ Detail Temuan / Blind Spot: ${message}`);
  }
}

async function runBranchAdminAudit() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - COMPREHENSIVE BRANCH ADMIN & MANAGER ADVERSARIAL SUITE      ║');
  console.log('║   STRICT NO-HAPPY-PATH: Cross-Branch Isolation, Assisted Booking, Segregation║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const policy = new PolicyService();
  const idempotency = new IdempotencyService(db as any);
  const auditService = new AuditService(db as any);
  const packageAccess = new PackageAccessService(db as any, policy, auditService);

  const runtimeConfig = {
    value: {
      quotaEvaluation: { maxAttempts: 5 },
      booking: { enabled: true, cutoffHours: 2 },
      bookingCancellation: { enabled: true, cutoffHours: 24 },
    },
  } as any;

  const accessManagementService = new AccessManagementService(db as any, policy, idempotency);
  const classSlotService = new ClassSlotService(db as any, policy, idempotency, runtimeConfig);
  const bookingsService = new BookingsService(db as any, idempotency, policy, runtimeConfig);
  const attendanceService = new AttendanceService(db as any, policy, idempotency);
  const paymentReviewService = new PaymentReviewService(db as any, idempotency, packageAccess);
  const ledgerService = new LedgerService(db as any, policy, auditService);
  const financeService = new FinanceService(db as any, policy, auditService);

  // Arrays untuk cleanup
  const cleanupUserIds: string[] = [];
  const cleanupSlotIds: string[] = [];
  const cleanupBookingIds: string[] = [];
  const cleanupPackageIds: string[] = [];
  const cleanupCustomerPackageIds: string[] = [];
  const cleanupPurchaseIds: string[] = [];
  const cleanupAdjustmentIds: string[] = [];

  const uniqueSuffix = () => `${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    console.log('▶ Menyiapkan Aktor Uji (Admin Cabang A, Manager Cabang A, Admin Cabang B)...');

    const passwordHash = await argon2.hash('StaffSecurePass123!');

    // Cabang A & Cabang B
    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) throw new Error('Minimal 2 cabang diperlukan dalam database.');
    const [branchA, branchB] = branches;

    // 1. Admin Cabang A
    const adminBranchAUser = await db.user.create({
      data: {
        id: randomUUID(),
        email: `admin.a.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Admin Cabang A',
        phone: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        preferredBranchId: branchA.id,
      },
    });
    cleanupUserIds.push(adminBranchAUser.id);

    // 2. Manager Cabang A
    const managerBranchAUser = await db.user.create({
      data: {
        id: randomUUID(),
        email: `manager.a.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Manager Cabang A',
        phone: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.MANAGER,
        status: UserStatus.ACTIVE,
        preferredBranchId: branchA.id,
      },
    });
    cleanupUserIds.push(managerBranchAUser.id);

    // 3. Admin Cabang B
    const adminBranchBUser = await db.user.create({
      data: {
        id: randomUUID(),
        email: `admin.b.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Admin Cabang B',
        phone: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        preferredBranchId: branchB.id,
      },
    });
    cleanupUserIds.push(adminBranchBUser.id);

    // 4. Customer Aktif di Cabang A
    const customerUser = await db.user.create({
      data: {
        id: randomUUID(),
        email: `cust.audit.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Audit Customer',
        phone: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        preferredBranchId: branchA.id,
      },
    });
    cleanupUserIds.push(customerUser.id);

    // 5. Customer Suspended di Cabang A
    const suspendedCustomer = await db.user.create({
      data: {
        id: randomUUID(),
        email: `cust.susp.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Suspended Customer',
        phone: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.CUSTOMER,
        status: UserStatus.SUSPENDED,
        preferredBranchId: branchA.id,
      },
    });
    cleanupUserIds.push(suspendedCustomer.id);

    // Instruktur & Studio
    const instructor = await db.user.findFirstOrThrow({
      where: { role: Role.INSTRUCTOR },
    });
    const studiosA = await db.studio.findMany({ where: { branchId: branchA.id }, take: 1 });
    const studioA = studiosA[0] ?? (await db.studio.findFirstOrThrow());
    const studiosB = await db.studio.findMany({ where: { branchId: branchB.id }, take: 1 });
    const studioB = studiosB[0] ?? studioA;
    const classTypes = await db.jenisKelas.findMany({ take: 2 });
    const classTypeA = classTypes[0];

    // Buat Principals dengan capabilityGrants terisi presisi
    const adminAAccess = policy.resolveAccess(adminBranchAUser.id, [{ role: 'ADMIN', branchId: branchA.id }]);
    const principalAdminA: SessionPrincipal = {
      sessionId: randomUUID(),
      userId: adminBranchAUser.id,
      roles: [{ role: 'ADMIN', branchId: branchA.id }],
      capabilities: adminAAccess.capabilities,
      branchIds: adminAAccess.branchIds,
      capabilityGrants: adminAAccess.grants,
      capabilityDenials: adminAAccess.denials,
      sessionExpiresAt: new Date(Date.now() + 3600_000),
      passwordChangeRequired: false,
    };

    const managerAAccess = policy.resolveAccess(managerBranchAUser.id, [{ role: 'MANAGER', branchId: branchA.id }]);
    const principalManagerA: SessionPrincipal = {
      sessionId: randomUUID(),
      userId: managerBranchAUser.id,
      roles: [{ role: 'MANAGER', branchId: branchA.id }],
      capabilities: managerAAccess.capabilities,
      branchIds: managerAAccess.branchIds,
      capabilityGrants: managerAAccess.grants,
      capabilityDenials: managerAAccess.denials,
      sessionExpiresAt: new Date(Date.now() + 3600_000),
      passwordChangeRequired: false,
    };

    // Siapkan Pembelian & Paket Pelanggan Aktif di Cabang A
    const activePkg = await db.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
    const purchaseA = await db.pembelian.create({
      data: {
        id: randomUUID(),
        invoiceNumber: `INV-INIT-${uniqueSuffix()}`,
        userId: customerUser.id,
        packageId: activePkg.id,
        branchId: branchA.id,
        subtotalRp: 1500000,
        totalAmountRp: 1500000,
        status: PurchaseStatus.PAID,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paidAt: new Date(),
      },
    });
    cleanupPurchaseIds.push(purchaseA.id);

    const custPkgActive = await db.paketPelanggan.create({
      data: {
        id: randomUUID(),
        userId: customerUser.id,
        packageId: activePkg.id,
        purchaseId: purchaseA.id,
        totalSessions: 10,
        remainingSessions: 10,
        usedSessions: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 86400_000),
        status: 'ACTIVE',
      },
    });
    cleanupCustomerPackageIds.push(custPkgActive.id);

    // Paket Pelanggan Kuota Habis (0 sesi)
    const custPkgEmpty = await db.paketPelanggan.create({
      data: {
        id: randomUUID(),
        userId: customerUser.id,
        packageId: activePkg.id,
        totalSessions: 5,
        remainingSessions: 0, // Kuota 0
        usedSessions: 5,
        validFrom: new Date(Date.now() - 10 * 86400_000),
        validUntil: new Date(Date.now() + 20 * 86400_000),
        status: 'ACTIVE',
      },
    });
    cleanupCustomerPackageIds.push(custPkgEmpty.id);

    // ========================================================================
    // PILAR 1: CROSS-BRANCH ISOLATION & IDOR DEFENSE
    // ========================================================================
    console.log('\n▶ PILAR 1: Cross-Branch Isolation & Scope Barrier Invariants...');

    // 1.1 Admin Cabang A dilarang membuat slot kelas di Cabang B
    {
      const t0 = Date.now();
      const startTime = new Date(Date.now() + 15 * 86_400_000);
      const endTime = new Date(startTime.getTime() + 60 * 60_000);
      try {
        await classSlotService.create(
          principalAdminA,
          {
            branchId: branchB.id, // Cabang B
            studioId: studioB.id,
            classTypeId: classTypeA.id,
            startAt: startTime.toISOString(),
            endAt: endTime.toISOString(),
          },
          `key-adm-1.1-${uniqueSuffix()}`,
          'trace-adm-1.1',
        );
        record(
          'ADM_BR_1',
          'Cross-Branch',
          'Admin Cabang A dicekal membuat slot kelas di Cabang B',
          'SECURITY',
          false,
          'Admin Cabang A berhasil membuat slot kelas di Cabang B!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'RESOURCE_NOT_FOUND' || err?.code === 'FORBIDDEN' || err?.status === 404 || err?.status === 403;
        record(
          'ADM_BR_1',
          'Cross-Branch',
          'Admin Cabang A dicekal membuat slot kelas di Cabang B',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan tepat (RESOURCE_NOT_FOUND 404)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // Siapkan slot di Cabang B untuk pengujian cross-branch booking
    const slotBranchB = await db.slotKelas.create({
      data: {
        id: randomUUID(),
        branchId: branchB.id,
        studioId: studioB.id,
        classTypeId: classTypeA.id,
        instructorId: instructor.id,
        startAt: new Date(Date.now() + 5 * 86400_000),
        endAt: new Date(Date.now() + 5 * 86400_000 + 3600_000),
        capacity: 10,
        bookedCount: 0,
        status: ClassSlotStatus.PUBLISHED,
      },
    });
    cleanupSlotIds.push(slotBranchB.id);

    // 1.2 Admin Cabang A dilarang melakukan assisted booking di slot Cabang B
    {
      const t0 = Date.now();
      try {
        await bookingsService.create(
          principalAdminA,
          {
            classSlotId: slotBranchB.id,
            customerPackageId: custPkgActive.id,
            customerUserId: customerUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-adm-1.2-${uniqueSuffix()}`,
          'trace-adm-1.2',
        );
        record(
          'ADM_BR_2',
          'Cross-Branch',
          'Admin Cabang A dicekal melakukan assisted booking untuk slot Cabang B',
          'SECURITY',
          false,
          'Admin Cabang A berhasil membukukan kelas di Cabang B!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'RESOURCE_NOT_FOUND' || err?.code === 'FORBIDDEN' || err?.status === 404 || err?.status === 403;
        record(
          'ADM_BR_2',
          'Cross-Branch',
          'Admin Cabang A dicekal melakukan assisted booking untuk slot Cabang B',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan tepat (RESOURCE_NOT_FOUND 404)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 1.3 Admin Cabang A dilarang mengakses laporan keuangan Cabang B
    {
      const t0 = Date.now();
      try {
        await financeService.omsetReport(principalAdminA, { branchId: branchB.id, period: '2026-09' });
        record(
          'ADM_BR_3',
          'Cross-Branch',
          'Admin Cabang A dicekal mengakses laporan finansial Cabang B',
          'SECURITY',
          false,
          'Admin Cabang A berhasil mengintip laporan keuangan Cabang B!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'FORBIDDEN' || err?.code === 'RESOURCE_NOT_FOUND' || err?.status === 403 || err?.status === 404;
        record(
          'ADM_BR_3',
          'Cross-Branch',
          'Admin Cabang A dicekal mengakses laporan finansial Cabang B',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan FORBIDDEN (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 2: ASSISTED BOOKING & QUOTA BOUNDARIES
    // ========================================================================
    console.log('\n▶ PILAR 2: Assisted Booking & Quota Enforcement...');

    // Buat slot sah di Cabang A
    const slotBranchA = await db.slotKelas.create({
      data: {
        id: randomUUID(),
        branchId: branchA.id,
        studioId: studioA.id,
        classTypeId: classTypeA.id,
        instructorId: instructor.id,
        startAt: new Date(Date.now() + 6 * 86400_000),
        endAt: new Date(Date.now() + 6 * 86400_000 + 3600_000),
        capacity: 1, // Kapasitas hanya 1 orang untuk uji kapasitas penuh
        bookedCount: 0,
        status: ClassSlotStatus.PUBLISHED,
      },
    });
    cleanupSlotIds.push(slotBranchA.id);

    // 2.1 Assisted Booking Berhasil untuk slot sah (Baseline Validasi)
    let firstBookingId = '';
    {
      const t0 = Date.now();
      try {
        const res = await bookingsService.create(
          principalAdminA,
          {
            classSlotId: slotBranchA.id,
            customerPackageId: custPkgActive.id,
            customerUserId: customerUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-adm-2.1-${uniqueSuffix()}`,
          'trace-adm-2.1',
        );
        firstBookingId = (res as any)?.body?.id;
        if (firstBookingId) cleanupBookingIds.push(firstBookingId);
        record(
          'ADM_BK_VALID',
          'Booking',
          'Assisted booking berhasil untuk kuota dan slot yang sah',
          'FLOW',
          Boolean(firstBookingId),
          'Booking sah berhasil dibuat',
          Date.now() - t0,
        );
      } catch (err: any) {
        record(
          'ADM_BK_VALID',
          'Booking',
          'Assisted booking berhasil untuk kuota dan slot yang sah',
          'FLOW',
          false,
          `Gagal membuat booking: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 2.2 Booking pada slot yang sudah penuh (Capacity Full) ditolak
    {
      const t0 = Date.now();
      const secondCustomer = await db.user.create({
        data: {
          id: randomUUID(),
          email: `cust2.${uniqueSuffix()}@dailydose.test`,
          displayName: 'Second Customer',
          phone: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`,
          passwordHash,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          preferredBranchId: branchA.id,
        },
      });
      cleanupUserIds.push(secondCustomer.id);

      const custPkg2 = await db.paketPelanggan.create({
        data: {
          id: randomUUID(),
          userId: secondCustomer.id,
          packageId: activePkg.id,
          totalSessions: 10,
          remainingSessions: 10,
          usedSessions: 0,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 86400_000),
          status: 'ACTIVE',
        },
      });
      cleanupCustomerPackageIds.push(custPkg2.id);

      try {
        await bookingsService.create(
          principalAdminA,
          {
            classSlotId: slotBranchA.id,
            customerPackageId: custPkg2.id,
            customerUserId: secondCustomer.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-adm-2.2-${uniqueSuffix()}`,
          'trace-adm-2.2',
        );
        record(
          'ADM_BK_1',
          'Booking',
          'Booking pada slot yang telah mencapai batas kapasitas ditolak (Overbooking Guard)',
          'EDGE',
          false,
          'Kelas berhasil dibooking melebihi kapasitas studio!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'SLOT_FULL' || err?.status === 409;
        record(
          'ADM_BK_1',
          'Booking',
          'Booking pada slot yang telah mencapai batas kapasitas ditolak (Overbooking Guard)',
          'EDGE',
          passed,
          passed ? 'Dicekal dengan SLOT_FULL (409 Conflict)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 2.3 Booking dengan paket yang sisa kuotanya 0 ditolak
    {
      const t0 = Date.now();
      const slotEmptyTest = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studioA.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 7 * 86400_000),
          endAt: new Date(Date.now() + 7 * 86400_000 + 3600_000),
          capacity: 10,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(slotEmptyTest.id);

      try {
        await bookingsService.create(
          principalAdminA,
          {
            classSlotId: slotEmptyTest.id,
            customerPackageId: custPkgEmpty.id, // Sisa 0 sesi
            customerUserId: customerUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-adm-2.3-${uniqueSuffix()}`,
          'trace-adm-2.3',
        );
        record(
          'ADM_BK_2',
          'Booking',
          'Booking menggunakan paket dengan kuota 0 sesi dicekal',
          'NEGATIVE',
          false,
          'Customer berhasil membukukan kelas dengan saldo 0 sesi!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'INSUFFICIENT_AVAILABLE_SESSIONS' || err?.status === 409;
        record(
          'ADM_BK_2',
          'Booking',
          'Booking menggunakan paket dengan kuota 0 sesi dicekal',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan INSUFFICIENT_AVAILABLE_SESSIONS (409)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 2.4 Booking untuk customer berstatus SUSPENDED dicekal
    {
      const t0 = Date.now();
      const slotSuspTest = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studioA.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 8 * 86400_000),
          endAt: new Date(Date.now() + 8 * 86400_000 + 3600_000),
          capacity: 10,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(slotSuspTest.id);

      const custPkgSusp = await db.paketPelanggan.create({
        data: {
          id: randomUUID(),
          userId: suspendedCustomer.id,
          packageId: activePkg.id,
          totalSessions: 10,
          remainingSessions: 10,
          usedSessions: 0,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 86400_000),
          status: 'ACTIVE',
        },
      });
      cleanupCustomerPackageIds.push(custPkgSusp.id);

      try {
        await bookingsService.create(
          principalAdminA,
          {
            classSlotId: slotSuspTest.id,
            customerPackageId: custPkgSusp.id,
            customerUserId: suspendedCustomer.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-adm-2.4-${uniqueSuffix()}`,
          'trace-adm-2.4',
        );
        record(
          'ADM_BK_3',
          'Booking',
          'Booking untuk customer berstatus SUSPENDED dicekal',
          'SECURITY',
          false,
          'Customer suspended berhasil dibooking oleh admin!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'RESOURCE_NOT_FOUND' || err?.status === 404 || err?.status === 403;
        record(
          'ADM_BK_3',
          'Booking',
          'Booking untuk customer berstatus SUSPENDED dicekal',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan RESOURCE_NOT_FOUND (404)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 2.5 Booking duplikat pada slot yang sama oleh customer yang sama ditolak
    {
      const t0 = Date.now();
      const slotDupTest = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studioA.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 9 * 86400_000),
          endAt: new Date(Date.now() + 9 * 86400_000 + 3600_000),
          capacity: 10,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(slotDupTest.id);

      // Booking 1
      const res1 = await bookingsService.create(
        principalAdminA,
        {
          classSlotId: slotDupTest.id,
          customerPackageId: custPkgActive.id,
          customerUserId: customerUser.id,
          source: 'ADMIN_ASSISTED',
        },
        `key-adm-2.5a-${uniqueSuffix()}`,
        'trace-adm-2.5a',
      );
      const booking1Id = (res1 as any)?.body?.id;
      if (booking1Id) cleanupBookingIds.push(booking1Id);

      try {
        // Booking 2 (Duplikat)
        await bookingsService.create(
          principalAdminA,
          {
            classSlotId: slotDupTest.id,
            customerPackageId: custPkgActive.id,
            customerUserId: customerUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-adm-2.5b-${uniqueSuffix()}`,
          'trace-adm-2.5b',
        );
        record(
          'ADM_BK_4',
          'Booking',
          'Booking ganda pada slot yang sama dicekal (DUPLICATE_ACTIVE_BOOKING)',
          'NEGATIVE',
          false,
          'Customer berhasil membukukan kelas yang sama 2 kali!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'DUPLICATE_ACTIVE_BOOKING' || err?.status === 409;
        record(
          'ADM_BK_4',
          'Booking',
          'Booking ganda pada slot yang sama dicekal (DUPLICATE_ACTIVE_BOOKING)',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan DUPLICATE_ACTIVE_BOOKING (409)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 3: ATTENDANCE & CHECK-IN INTEGRITY
    // ========================================================================
    console.log('\n▶ PILAR 3: Attendance Check-In Integrity & Anti-Tampering...');

    // 3.1 Token check-in untuk booking yang berstatus CANCELLED dicekal
    {
      const t0 = Date.now();
      const slotCancelTest = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studioA.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: new Date(Date.now() + 10 * 86400_000),
          endAt: new Date(Date.now() + 10 * 86400_000 + 3600_000),
          capacity: 10,
          bookedCount: 0,
          status: ClassSlotStatus.CONFIRMED,
        },
      });
      cleanupSlotIds.push(slotCancelTest.id);

      const cancelBooking = await db.pemesananKelas.create({
        data: {
          id: randomUUID(),
          bookingNumber: `BK-CANC-${uniqueSuffix()}`,
          userId: customerUser.id,
          classSlotId: slotCancelTest.id,
          customerPackageId: custPkgActive.id,
          status: 'CANCELLED', // Dibatalkan
        },
      });
      cleanupBookingIds.push(cancelBooking.id);

      try {
        await attendanceService.issue(
          principalAdminA,
          cancelBooking.id,
          {},
          `key-att-3.1-${uniqueSuffix()}`,
          'trace-att-3.1',
        );
        record(
          'ADM_ATT_1',
          'Absensi',
          'Penerbitan token absensi untuk booking berstatus CANCELLED dicekal',
          'EDGE',
          false,
          'Token absensi berhasil diterbitkan untuk pesanan yang batal!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'INVALID_STATE_TRANSITION' || err?.status === 409;
        record(
          'ADM_ATT_1',
          'Absensi',
          'Penerbitan token absensi untuk booking berstatus CANCELLED dicekal',
          'EDGE',
          passed,
          passed ? 'Dicekal dengan INVALID_STATE_TRANSITION (409)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 3.2 Token check-in palsu / corrupted ditolak
    {
      const t0 = Date.now();
      try {
        await attendanceService.consume(
          principalAdminA,
          { token: 'corrupted-fake-invalid-token-string-value-12345678901234567' },
          `key-att-3.2-${uniqueSuffix()}`,
          'trace-att-3.2',
        );
        record(
          'ADM_ATT_2',
          'Absensi',
          'Konsumsi token QR palsu atau tidak valid dicekal (CHECK_IN_TOKEN_INVALID)',
          'NEGATIVE',
          false,
          'Token palsu berhasil dikonsumsi!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'CHECK_IN_TOKEN_INVALID' || err?.status === 404;
        record(
          'ADM_ATT_2',
          'Absensi',
          'Konsumsi token QR palsu atau tidak valid dicekal (CHECK_IN_TOKEN_INVALID)',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan CHECK_IN_TOKEN_INVALID (404)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 4: FRONT-DESK SALES & MAKER-CHECKER (SEPARATION OF DUTIES)
    // ========================================================================
    console.log('\n▶ PILAR 4: Front-Desk Sale Maker-Checker Segregation...');

    // 4.1 Admin Cabang dilarang menyetujui transaksi penjualan yang ia catat sendiri
    {
      const t0 = Date.now();
      const adminSale = await db.pembelian.create({
        data: {
          id: randomUUID(),
          invoiceNumber: `INV-ADM-SALE-${uniqueSuffix()}`,
          userId: customerUser.id,
          branchId: branchA.id,
          packageId: activePkg.id,
          subtotalRp: 750_000,
          totalAmountRp: 750_000,
          status: PurchaseStatus.WAITING_VERIFICATION,
          paymentMethod: PaymentMethod.CASH,
          recordedById: adminBranchAUser.id, // Admin A yang mencatat
        },
      });
      cleanupPurchaseIds.push(adminSale.id);

      try {
        await paymentReviewService.decide(
          principalAdminA,
          adminSale.id,
          'APPROVED',
          { reasonCode: 'PAYMENT_VERIFIED' },
          `key-sale-4.1-${uniqueSuffix()}`,
          'trace-sale-4.1',
        );
        record(
          'ADM_SALE_1',
          'Penjualan',
          'Admin pencatat penjualan dilarang menyetujui transaksinya sendiri (Rule #9 Maker-Checker)',
          'SECURITY',
          false,
          'Admin berhasil menyetujui penjualan tunai yang ia catat sendiri!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'SEPARATION_OF_DUTIES_VIOLATION' || err?.code === 'FORBIDDEN' || err?.status === 403;
        record(
          'ADM_SALE_1',
          'Penjualan',
          'Admin pencatat penjualan dilarang menyetujui transaksinya sendiri (Rule #9 Maker-Checker)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan tepat (SEPARATION_OF_DUTIES_VIOLATION / FORBIDDEN)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 4.2 Admin Cabang dilarang memutuskan verifikasi pembelian (Role Admin tidak memegang purchase:decide)
    {
      const t0 = Date.now();
      const otherSale = await db.pembelian.create({
        data: {
          id: randomUUID(),
          invoiceNumber: `INV-OTH-SALE-${uniqueSuffix()}`,
          userId: customerUser.id,
          branchId: branchA.id,
          packageId: activePkg.id,
          subtotalRp: 800_000,
          totalAmountRp: 800_000,
          status: PurchaseStatus.WAITING_VERIFICATION,
          paymentMethod: PaymentMethod.CASH,
          recordedById: managerBranchAUser.id,
        },
      });
      cleanupPurchaseIds.push(otherSale.id);

      try {
        await paymentReviewService.decide(
          principalAdminA,
          otherSale.id,
          'APPROVED',
          { reasonCode: 'PAYMENT_VERIFIED' },
          `key-sale-4.2-${uniqueSuffix()}`,
          'trace-sale-4.2',
        );
        record(
          'ADM_SALE_2',
          'Penjualan',
          'Admin cabang dilarang memutuskan pembayaran (Hanya Manager/Finance memegang purchase:decide)',
          'SECURITY',
          false,
          'Admin cabang berhasil memutuskan verifikasi pembayaran!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'FORBIDDEN' || err?.status === 403;
        record(
          'ADM_SALE_2',
          'Penjualan',
          'Admin cabang dilarang memutuskan pembayaran (Hanya Manager/Finance memegang purchase:decide)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan FORBIDDEN (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 4.3 Manager Cabang DAPAT menyetujui penjualan sah yang dicatat Admin (Segregation of Duties Terpenuhi)
    {
      const t0 = Date.now();
      const validAdminSale = await db.pembelian.create({
        data: {
          id: randomUUID(),
          invoiceNumber: `INV-MGR-APP-${uniqueSuffix()}`,
          userId: customerUser.id,
          branchId: branchA.id,
          packageId: activePkg.id,
          subtotalRp: 900_000,
          totalAmountRp: 900_000,
          status: PurchaseStatus.WAITING_VERIFICATION,
          paymentMethod: PaymentMethod.CASH,
          recordedById: adminBranchAUser.id, // Dicatat oleh Admin
        },
      });
      cleanupPurchaseIds.push(validAdminSale.id);

      try {
        await paymentReviewService.decide(
          principalManagerA, // Disetujui oleh Manager (pihak terpisah)
          validAdminSale.id,
          'APPROVED',
          { reasonCode: 'PAYMENT_VERIFIED', note: 'Approved by Branch Manager' },
          `key-sale-4.3-${uniqueSuffix()}`,
          'trace-sale-4.3',
        );
        const updated = await db.pembelian.findUnique({ where: { id: validAdminSale.id } });
        const passed = updated?.status === PurchaseStatus.PAID && updated?.verifiedById === managerBranchAUser.id;
        record(
          'MGR_SALE_1',
          'Penjualan',
          'Manager cabang berhasil menyetujui transaksi sah yang dicatat oleh Admin (Valid Segregation)',
          'FLOW',
          passed,
          passed ? 'Transaksi beralih ke PAID dan diverifikasi oleh Manager' : 'Status gagal diperbarui',
          Date.now() - t0,
        );
      } catch (err: any) {
        record(
          'MGR_SALE_1',
          'Penjualan',
          'Manager cabang berhasil menyetujui transaksi sah yang dicatat oleh Admin (Valid Segregation)',
          'FLOW',
          false,
          `Gagal disetujui: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 5: SESSION LEDGER ADJUSTMENT MAKER-CHECKER
    // ========================================================================
    console.log('\n▶ PILAR 5: Session Ledger Adjustment Maker-Checker...');

    // 5.1 Admin Cabang mengajukan penyesuaian kuota sesi pelanggan
    let adjustmentId = '';
    {
      const t0 = Date.now();
      try {
        const res = await ledgerService.requestAdjustment(principalAdminA, {
          customerPackageId: custPkgActive.id,
          quantity: 2,
          reasonCode: 'PACKAGE_COMPENSATION',
        });
        adjustmentId = (res as any)?.id;
        cleanupAdjustmentIds.push(adjustmentId);
        record(
          'ADM_ADJ_REQ',
          'Ledger',
          'Admin cabang berhasil mengajukan penyesuaian saldo kuota sesi pelanggan',
          'FLOW',
          Boolean(adjustmentId),
          'Permohonan adjustment berhasil dibuat',
          Date.now() - t0,
        );
      } catch (err: any) {
        record(
          'ADM_ADJ_REQ',
          'Ledger',
          'Admin cabang berhasil mengajukan penyesuaian saldo kuota sesi pelanggan',
          'FLOW',
          false,
          `Gagal mengajukan adjustment: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.2 Admin Cabang dilarang memutus/menyetujui permohonan adjustment (Role Admin tidak punya ledger:adjust:decide)
    if (adjustmentId) {
      const t0 = Date.now();
      try {
        await ledgerService.decideAdjustment(
          principalAdminA,
          adjustmentId,
          'approve',
          { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 1 },
        );
        record(
          'ADM_ADJ_1',
          'Ledger',
          'Admin cabang dilarang memutuskan penyesuaian saldo kuota (Hanya Manager/Finance)',
          'SECURITY',
          false,
          'Admin berhasil memutus permohonan adjustment!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'FORBIDDEN' || err?.status === 403;
        record(
          'ADM_ADJ_1',
          'Ledger',
          'Admin cabang dilarang memutuskan penyesuaian saldo kuota (Hanya Manager/Finance)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan FORBIDDEN (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.3 Pengaju permohonan dilarang memutus permohonannya sendiri (Self-Approval Lock / SEPARATION_OF_DUTIES)
    if (adjustmentId) {
      const t0 = Date.now();
      const selfDecidingPrincipal: SessionPrincipal = {
        ...principalManagerA,
        userId: adminBranchAUser.id, // User yang sama dengan pengaju (Admin A)
      };

      try {
        await ledgerService.decideAdjustment(
          selfDecidingPrincipal,
          adjustmentId,
          'approve',
          { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 1 },
        );
        record(
          'MGR_ADJ_1',
          'Ledger',
          'Pengaju dilarang menyetujui koreksi kuota yang dia ajukan sendiri (Rule #10 Segregation)',
          'SECURITY',
          false,
          'Pengaju berhasil menyetujui permohonan koreksinya sendiri!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'SEPARATION_OF_DUTIES' || err?.status === 403;
        record(
          'MGR_ADJ_1',
          'Ledger',
          'Pengaju dilarang menyetujui koreksi kuota yang dia ajukan sendiri (Rule #10 Segregation)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan SEPARATION_OF_DUTIES (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.4 Manager Cabang berhasil menyetujui koreksi yang diajukan oleh Admin (Valid Segregation)
    if (adjustmentId) {
      const t0 = Date.now();
      try {
        await ledgerService.decideAdjustment(
          principalManagerA,
          adjustmentId,
          'approve',
          { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 1, note: 'Approved by Branch Manager' },
        );
        const adjRow = await db.sessionAdjustRequest.findUnique({ where: { id: adjustmentId } });
        const passed = adjRow?.status === 'APPROVED' && adjRow?.approvedById === managerBranchAUser.id;
        record(
          'MGR_ADJ_2',
          'Ledger',
          'Manager cabang berhasil menyetujui koreksi kuota yang diajukan oleh Admin',
          'FLOW',
          passed,
          passed ? 'Status permohonan APPROVED dan disetujui oleh Manager' : 'Status gagal diperbarui',
          Date.now() - t0,
        );
      } catch (err: any) {
        record(
          'MGR_ADJ_2',
          'Ledger',
          'Manager cabang berhasil menyetujui koreksi kuota yang diajukan oleh Admin',
          'FLOW',
          false,
          `Gagal disetujui: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.5 Eksekusi ulang pada koreksi yang sudah diputus dicekal (Double-Decision Lock)
    if (adjustmentId) {
      const t0 = Date.now();
      try {
        await ledgerService.decideAdjustment(
          principalManagerA,
          adjustmentId,
          'approve',
          { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 2 },
        );
        record(
          'MGR_ADJ_3',
          'Ledger',
          'Eksekusi ulang keputusan pada permohonan yang sudah selesai dicekal (ADJUSTMENT_ALREADY_DECIDED)',
          'EDGE',
          false,
          'Keputusan berhasil diproses ganda!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'ADJUSTMENT_ALREADY_DECIDED' || err?.status === 409;
        record(
          'MGR_ADJ_3',
          'Ledger',
          'Eksekusi ulang keputusan pada permohonan yang sudah selesai dicekal (ADJUSTMENT_ALREADY_DECIDED)',
          'EDGE',
          passed,
          passed ? 'Dicekal dengan ADJUSTMENT_ALREADY_DECIDED (409)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 6: ANTI-ESCALATION & SCOPE BOUNDARY
    // ========================================================================
    console.log('\n▶ PILAR 6: Privilege Escalation & Role Boundaries...');

    // 6.1 Admin Cabang dilarang mengubah role pengguna lain
    {
      const t0 = Date.now();
      try {
        await accessManagementService.replaceUserRoles(
          principalAdminA,
          customerUser.id,
          {
            roles: [{ roleId: 'ADMIN', branchId: branchA.id }],
            reasonCode: 'ILLEGAL_ESCALATION',
          },
          `key-esc-6.1-${uniqueSuffix()}`,
          'trace-esc-6.1',
        );
        record(
          'ADM_ESC_1',
          'Privilege',
          'Admin cabang dilarang mengubah atau memberikan peran kepada pengguna lain',
          'SECURITY',
          false,
          'Admin cabang berhasil mengangkat user lain menjadi Admin!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'FORBIDDEN' || err?.status === 403;
        record(
          'ADM_ESC_1',
          'Privilege',
          'Admin cabang dilarang mengubah atau memberikan peran kepada pengguna lain',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan FORBIDDEN (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 6.2 Manager Cabang dilarang mengangkat user ke SUPER_OWNER
    {
      const t0 = Date.now();
      try {
        await accessManagementService.replaceUserRoles(
          principalManagerA,
          customerUser.id,
          {
            roles: [{ roleId: 'SUPER_OWNER', branchId: null }],
            reasonCode: 'ILLEGAL_SO_ESCALATION',
          },
          `key-esc-6.2-${uniqueSuffix()}`,
          'trace-esc-6.2',
        );
        record(
          'MGR_ESC_1',
          'Privilege',
          'Manager cabang dilarang mengangkat user ke SUPER_OWNER',
          'SECURITY',
          false,
          'Manager berhasil mengangkat user ke SUPER_OWNER!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'FORBIDDEN' || err?.code === 'ROLE_NOT_ASSIGNABLE' || err?.status === 403 || err?.status === 422;
        record(
          'MGR_ESC_1',
          'Privilege',
          'Manager cabang dilarang mengangkat user ke SUPER_OWNER',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan FORBIDDEN / ROLE_NOT_ASSIGNABLE' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // RINGKASAN HASIL AUDIT ADMIN CABANG & MANAGER
    // ========================================================================
    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 REKAPITULASI AUDIT & HASIL TESTING ADMIN & MANAGER CABANG (NO HAPPY PATH)');
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
      console.log('🎉 SELURUH SKENARIO ADVERSARIAL ADMIN & MANAGER LULUS 100%! SEMUA PERLINDUNGAN UTUH.');
    }

  } finally {
    console.log('\n🧹 Membersihkan data temporer pengujian Admin & Manager Cabang...');
    try {
      if (cleanupBookingIds.length) {
        const validBookingIds = cleanupBookingIds.filter(Boolean);
        if (validBookingIds.length) {
          await db.checkInToken.deleteMany({ where: { bookingId: { in: validBookingIds } } });
          await db.kehadiranPelanggan.deleteMany({ where: { bookingId: { in: validBookingIds } } });
          await db.pemesananKelas.deleteMany({ where: { id: { in: validBookingIds } } });
        }
      }
      if (cleanupAdjustmentIds.length) {
        await db.sessionAdjustRequest.deleteMany({ where: { id: { in: cleanupAdjustmentIds } } });
      }
      if (cleanupCustomerPackageIds.length) {
        await db.pemesananKelas.deleteMany({ where: { customerPackageId: { in: cleanupCustomerPackageIds } } });
        await db.sessionLedger.deleteMany({ where: { customerPackageId: { in: cleanupCustomerPackageIds } } });
        await db.sessionAdjustRequest.deleteMany({ where: { customerPackageId: { in: cleanupCustomerPackageIds } } });
        await db.paketPelanggan.deleteMany({ where: { id: { in: cleanupCustomerPackageIds } } });
      }
      if (cleanupPurchaseIds.length) {
        await db.sessionLedger.deleteMany({ where: { customerPackage: { purchaseId: { in: cleanupPurchaseIds } } } });
        await db.sessionAdjustRequest.deleteMany({ where: { customerPackage: { purchaseId: { in: cleanupPurchaseIds } } } });
        await db.paketPelanggan.deleteMany({ where: { purchaseId: { in: cleanupPurchaseIds } } });
        await db.buktiPembayaran.deleteMany({ where: { purchaseId: { in: cleanupPurchaseIds } } });
        await db.pembelian.deleteMany({ where: { id: { in: cleanupPurchaseIds } } });
      }
      if (cleanupSlotIds.length) {
        await db.slotKelas.deleteMany({ where: { id: { in: cleanupSlotIds } } });
      }
      if (cleanupPackageIds.length) {
        await db.paket.deleteMany({ where: { id: { in: cleanupPackageIds } } });
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

runBranchAdminAudit().catch((err) => {
  console.error('\n💥 FATAL ERROR EXECUTION:', err);
  process.exit(1);
});
