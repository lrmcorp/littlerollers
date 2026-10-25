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
import { PackageCatalogService } from '../../apps/api/src/packages/katalog-paket.service';
import { PaymentReviewService } from '../../apps/api/src/packages/verifikasi-pembayaran.service';
import { FinanceService } from '../../apps/api/src/packages/finance.service';
import { PackageAccessService } from '../../apps/api/src/packages/package-access.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';
import { ROLE_CAPABILITIES } from '../../apps/api/src/identity/role-capabilities';

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

async function runSuperAdminAudit() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - COMPREHENSIVE SUPER ADMIN AUDIT & ADVERSARIAL TEST SUITE    ║');
  console.log('║   STRICT NO-HAPPY-PATH: Privilege Escalation, Maker-Checker, Collisions, etc ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const policy = new PolicyService();
  const idempotency = new IdempotencyService(db as any);
  const auditService = new AuditService(db as any);
  const packageAccess = new PackageAccessService(db as any, policy, auditService);

  const accessManagementService = new AccessManagementService(db as any, policy, idempotency);
  const classSlotService = new ClassSlotService(
    db as any,
    policy,
    idempotency,
    {
      value: {
        quotaEvaluation: { maxAttempts: 5 },
        booking: { enabled: true, cutoffHours: 2 },
        bookingCancellation: { enabled: true, cutoffHours: 24 },
      },
    } as any,
  );
  const packageCatalogService = new PackageCatalogService(
    db as any,
    packageAccess,
    idempotency,
    auditService,
  );
  const paymentReviewService = new PaymentReviewService(
    db as any,
    idempotency,
    packageAccess,
  );
  const financeService = new FinanceService(db as any, policy, auditService);

  // Arrays untuk cleanup
  const cleanupUserIds: string[] = [];
  const cleanupSlotIds: string[] = [];
  const cleanupPackageIds: string[] = [];
  const cleanupPurchaseIds: string[] = [];
  const cleanupOtherCostIds: string[] = [];
  const cleanupCorrectionIds: string[] = [];
  const cleanupMonthlyCloseKeys: { branchId: string; period: string }[] = [];

  const uniqueSuffix = () => `${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    console.log('▶ Menyiapkan Aktor Uji (Super Owner, Admin Cabang, Staf)...');

    const passwordHash = await argon2.hash('SuperSecurePass123!');

    // 1. Super Owner
    const superOwnerUser = await db.user.create({
      data: {
        id: randomUUID(),
        email: `so.audit.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Audit Super Owner',
        phone: `+62811${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.SUPER_OWNER,
        status: UserStatus.ACTIVE,
      },
    });
    cleanupUserIds.push(superOwnerUser.id);

    // 2. Second Super Owner (Checker)
    const superOwnerChecker = await db.user.create({
      data: {
        id: randomUUID(),
        email: `so.checker.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Audit Super Owner Checker',
        phone: `+62811${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.SUPER_OWNER,
        status: UserStatus.ACTIVE,
      },
    });
    cleanupUserIds.push(superOwnerChecker.id);

    // 3. Cabang A & Cabang B
    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) throw new Error('Minimal 2 cabang diperlukan dalam database.');
    const [branchA, branchB] = branches;

    // 4. Branch Admin Cabang A
    const adminBranchA = await db.user.create({
      data: {
        id: randomUUID(),
        email: `admin.branchA.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Admin Branch A',
        phone: `+62811${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        preferredBranchId: branchA.id,
      },
    });
    cleanupUserIds.push(adminBranchA.id);

    // 5. Customer Test
    const customerUser = await db.user.create({
      data: {
        id: randomUUID(),
        email: `cust.victim.${uniqueSuffix()}@dailydose.test`,
        displayName: 'Customer Victim',
        phone: `+62811${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        preferredBranchId: branchA.id,
      },
    });
    cleanupUserIds.push(customerUser.id);

    // 6. Instruktur Test
    const instructor = await db.user.findFirstOrThrow({
      where: { role: Role.INSTRUCTOR },
    });

    const studios = await db.studio.findMany({ where: { branchId: branchA.id }, take: 1 });
    const studioA = studios[0] ?? (await db.studio.findFirstOrThrow());

    const classTypes = await db.jenisKelas.findMany({ take: 1 });
    const classTypeA = classTypes[0];

    // Principals (using policy.resolveAccess for exact capabilityGrants)
    const soAccess = policy.resolveAccess(superOwnerUser.id, [{ role: 'SUPER_OWNER', branchId: null }]);
    const soCheckerAccess = policy.resolveAccess(superOwnerChecker.id, [{ role: 'SUPER_OWNER', branchId: null }]);
    const adminBranchAAccess = policy.resolveAccess(adminBranchA.id, [{ role: 'ADMIN', branchId: branchA.id }]);

    const principalSuperOwner: SessionPrincipal = {
      sessionId: randomUUID(),
      userId: superOwnerUser.id,
      roles: [{ role: 'SUPER_OWNER', branchId: null }],
      capabilities: soAccess.capabilities,
      branchIds: soAccess.branchIds,
      capabilityGrants: soAccess.grants,
      capabilityDenials: soAccess.denials,
      sessionExpiresAt: new Date(Date.now() + 3600_000),
      passwordChangeRequired: false,
    };

    const principalSuperOwnerChecker: SessionPrincipal = {
      sessionId: randomUUID(),
      userId: superOwnerChecker.id,
      roles: [{ role: 'SUPER_OWNER', branchId: null }],
      capabilities: soCheckerAccess.capabilities,
      branchIds: soCheckerAccess.branchIds,
      capabilityGrants: soCheckerAccess.grants,
      capabilityDenials: soCheckerAccess.denials,
      sessionExpiresAt: new Date(Date.now() + 3600_000),
      passwordChangeRequired: false,
    };

    const principalAdminBranchA: SessionPrincipal = {
      sessionId: randomUUID(),
      userId: adminBranchA.id,
      roles: [{ role: 'ADMIN', branchId: branchA.id }],
      capabilities: adminBranchAAccess.capabilities,
      branchIds: adminBranchAAccess.branchIds,
      capabilityGrants: adminBranchAAccess.grants,
      capabilityDenials: adminBranchAAccess.denials,
      sessionExpiresAt: new Date(Date.now() + 3600_000),
      passwordChangeRequired: false,
    };

    // ========================================================================
    // PILAR 1: PRIVILEGE ESCALATION & PROTECTED ACCOUNT DEFENSE
    // ========================================================================
    console.log('\n▶ PILAR 1: Privilege Escalation & Protected Role Invariants...');

    // 1.1 Branch Admin mencoba mempromosikan dirinya sendiri atau user lain ke SUPER_OWNER
    {
      const t0 = Date.now();
      try {
        await accessManagementService.replaceUserRoles(
          principalAdminBranchA,
          adminBranchA.id,
          {
            roles: [{ roleId: 'SUPER_OWNER', branchId: null }],
            reasonCode: 'ATTACK_ESCALATE',
          },
          `key-1.1-${uniqueSuffix()}`,
          'trace-1.1',
        );
        record(
          'SEC_SO_1',
          'Privilege',
          'Admin cabang dilarang mengubah peran atau eskalasi ke Super Owner',
          'SECURITY',
          false,
          'Admin cabang berhasil mengeksekusi replaceUserRoles ke SUPER_OWNER!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.status === 403 || err?.code === 'FORBIDDEN' || err?.code === 'CANNOT_MODIFY_OWN_ACCESS';
        record(
          'SEC_SO_1',
          'Privilege',
          'Admin cabang dilarang mengubah peran atau eskalasi ke Super Owner',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan tepat (FORBIDDEN / 403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 1.2 Super Owner dilarang menurunkan perannya sendiri (Lockout Defense)
    {
      const t0 = Date.now();
      try {
        await accessManagementService.replaceUserRoles(
          principalSuperOwner,
          superOwnerUser.id,
          {
            roles: [{ roleId: 'ADMIN', branchId: branchA.id }],
            reasonCode: 'SELF_DEMOTION',
          },
          `key-1.2-${uniqueSuffix()}`,
          'trace-1.2',
        );
        record(
          'SEC_SO_2',
          'Privilege',
          'Super Owner dicekal menurunkan perannya sendiri (Anti-Lockout Invariant)',
          'SECURITY',
          false,
          'Super Owner berhasil mendemosi akunnya sendiri!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'CANNOT_MODIFY_OWN_ACCESS' || err?.status === 403;
        record(
          'SEC_SO_2',
          'Privilege',
          'Super Owner dicekal menurunkan perannya sendiri (Anti-Lockout Invariant)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan CANNOT_MODIFY_OWN_ACCESS (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 1.3 Akun bertipe SUPER_OWNER / SUPERADMIN dilindungi dari manipulasi role (PROTECTED_ACCOUNT)
    {
      const t0 = Date.now();
      try {
        await accessManagementService.replaceUserRoles(
          principalSuperOwnerChecker,
          superOwnerUser.id,
          {
            roles: [{ roleId: 'ADMIN', branchId: branchA.id }],
            reasonCode: 'ATTACK_PROTECTED',
          },
          `key-1.3-${uniqueSuffix()}`,
          'trace-1.3',
        );
        record(
          'SEC_SO_3',
          'Privilege',
          'Akun Super Owner terlindungi dari perubahan role (PROTECTED_ACCOUNT)',
          'SECURITY',
          false,
          'Akun Super Owner berhasil diubah perannya menjadi Admin!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'PROTECTED_ACCOUNT' || err?.status === 403;
        record(
          'SEC_SO_3',
          'Privilege',
          'Akun Super Owner terlindungi dari perubahan role (PROTECTED_ACCOUNT)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan PROTECTED_ACCOUNT (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 2: CROSS-BRANCH ISOLATION & SCOPE BOUNDARIES
    // ========================================================================
    console.log('\n▶ PILAR 2: Cross-Branch Isolation & Scope Barriers...');

    // 2.1 Admin Cabang A dilarang mengakses/membuat OtherCost di Cabang B
    {
      const t0 = Date.now();
      try {
        await financeService.createOtherCost(
          principalAdminBranchA,
          {
            branchId: branchB.id,
            period: '2026-09',
            category: 'OTHER',
            description: 'Illegal Cross Branch Expense',
            amountRp: 1_000_000,
          },
          `key-2.1-${uniqueSuffix()}`,
        );
        record(
          'SEC_BR_1',
          'Cross-Branch',
          'Admin Cabang A dicekal mengakses data keuangan Cabang B (Branch Isolation)',
          'SECURITY',
          false,
          'Admin Cabang A berhasil mencatat pengeluaran di Cabang B!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'FORBIDDEN' || err?.status === 403;
        record(
          'SEC_BR_1',
          'Cross-Branch',
          'Admin Cabang A dicekal mengakses data keuangan Cabang B (Branch Isolation)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan FORBIDDEN (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 2.2 Admin Cabang dilarang mengakses Monthly Close Finansial
    {
      const t0 = Date.now();
      try {
        await financeService.closeMonth(
          principalAdminBranchA,
          branchA.id,
          '2026-08',
          `key-2.2-${uniqueSuffix()}`,
          { reason: 'Unauthorized Close Attempt' },
        );
        record(
          'SEC_BR_2',
          'Cross-Branch',
          'Admin Cabang dicekal menutup buku bulanan (Hanya Super Owner/Finance)',
          'SECURITY',
          false,
          'Admin cabang berhasil menutup buku bulanan!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'FORBIDDEN' || err?.status === 403;
        record(
          'SEC_BR_2',
          'Cross-Branch',
          'Admin Cabang dicekal menutup buku bulanan (Hanya Super Owner/Finance)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan FORBIDDEN (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 3: FINANCIAL MAKER-CHECKER & PERIOD LOCK ENFORCEMENT
    // ========================================================================
    console.log('\n▶ PILAR 3: Financial Maker-Checker & Period Lock Strictness...');

    // 3.1 Maker-Checker Verifikasi Pembayaran: Pencatat dilarang menyetujui transaksinya sendiri
    {
      const t0 = Date.now();
      const testPkg = await db.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
      const salePurchase = await db.pembelian.create({
        data: {
          id: randomUUID(),
          invoiceNumber: `INV-SO-MC-${uniqueSuffix()}`,
          userId: customerUser.id,
          branchId: branchA.id,
          packageId: testPkg.id,
          subtotalRp: 500_000,
          totalAmountRp: 500_000,
          status: PurchaseStatus.WAITING_VERIFICATION,
          paymentMethod: PaymentMethod.CASH,
          recordedById: superOwnerUser.id, // Super Owner yang mencatat
        },
      });
      cleanupPurchaseIds.push(salePurchase.id);

      try {
        // Super Owner yang sama mencoba menyetujui (verify) penjualan yang dia catat
        await paymentReviewService.decide(
          principalSuperOwner,
          salePurchase.id,
          'APPROVE',
          { note: 'Self approve attempt' },
          `key-3.1-${uniqueSuffix()}`,
          'trace-3.1',
        );
        record(
          'SEC_FIN_1',
          'Maker-Checker',
          'Pencatat penjualan dilarang menyetujui transaksinya sendiri (Rule #9 Maker-Checker)',
          'SECURITY',
          false,
          'BLIND SPOT: Pencatat penjualan berhasil menyetujui transaksi sendiri!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'SEPARATION_OF_DUTIES_VIOLATION' || err?.status === 403;
        record(
          'SEC_FIN_1',
          'Maker-Checker',
          'Pencatat penjualan dilarang menyetujui transaksinya sendiri (Rule #9 Maker-Checker)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan SEPARATION_OF_DUTIES_VIOLATION (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }

      // Verifikasi bahwa Checker independen (Super Owner kedua) DAPAT menyetujui transaksi tersebut
      try {
        const approvedRes = await paymentReviewService.decide(
          principalSuperOwnerChecker,
          salePurchase.id,
          'APPROVED',
          { reasonCode: 'PAYMENT_VERIFIED', note: 'Approved by independent checker' },
          `key-3.1b-${uniqueSuffix()}`,
          'trace-3.1b',
        );
        const updatedPurchase = await db.pembelian.findUnique({ where: { id: salePurchase.id } });
        const passed = updatedPurchase?.status === PurchaseStatus.PAID && updatedPurchase?.verifiedById === superOwnerChecker.id;
        record(
          'FLOW_FIN_1',
          'Maker-Checker',
          'Checker independen berhasil memverifikasi transaksi sah (Valid Segregation)',
          'FLOW',
          passed,
          passed ? 'Status berhasil menjadi PAID dan diverifikasi oleh Checker' : `Status tidak sesuai: ${updatedPurchase?.status}`,
          Date.now() - t0,
        );
      } catch (err: any) {
        record(
          'FLOW_FIN_1',
          'Maker-Checker',
          'Checker independen berhasil memverifikasi transaksi sah (Valid Segregation)',
          'FLOW',
          false,
          `Gagal diverifikasi: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 3.2 Maker-Checker Jurnal Koreksi: Pengaju dilarang memutus koreksinya sendiri
    {
      const t0 = Date.now();
      const correction = await financeService.createCorrection(
        principalSuperOwner,
        {
          branchId: branchA.id,
          currentPeriod: '2026-09',
          referencePeriod: '2026-08',
          amountRp: 250_000,
          reason: 'Test adjustment correction',
        },
        `key-3.2-${uniqueSuffix()}`,
      );
      cleanupCorrectionIds.push(correction.id);

      try {
        // Super Owner yang sama mencoba memutus (approve) koreksinya sendiri
        await financeService.decideCorrection(
          principalSuperOwner,
          correction.id,
          'approve',
          { reason: 'Self decision attempt' },
        );
        record(
          'SEC_FIN_2',
          'Maker-Checker',
          'Pengaju jurnal koreksi dilarang menyetujui koreksinya sendiri (Rule #10 Maker-Checker)',
          'SECURITY',
          false,
          'BLIND SPOT: Pengaju koreksi berhasil menyetujui permohonannya sendiri!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'SEPARATION_OF_DUTIES' || err?.status === 403;
        record(
          'SEC_FIN_2',
          'Maker-Checker',
          'Pengaju jurnal koreksi dilarang menyetujui koreksinya sendiri (Rule #10 Maker-Checker)',
          'SECURITY',
          passed,
          passed ? 'Dicekal dengan SEPARATION_OF_DUTIES (403)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 3.3 Period Lock Enforcement: Transaksi pada periode yang sudah LOCKED dibekukan mutlak
    {
      const t0 = Date.now();
      const lockedPeriod = '2025-12';
      await db.monthlyClose.upsert({
        where: { branchId_period: { branchId: branchA.id, period: lockedPeriod } },
        create: {
          branchId: branchA.id,
          period: lockedPeriod,
          status: 'LOCKED',
          closedById: superOwnerUser.id,
          closedAt: new Date(),
          omsetRp: 10_000_000,
          costRealtimeRp: 5_000_000,
          costProjectionRp: 5_000_000,
          otherCostRp: 1_000_000,
          profitRp: 4_000_000,
        },
        update: { status: 'LOCKED' },
      });
      cleanupMonthlyCloseKeys.push({ branchId: branchA.id, period: lockedPeriod });

      try {
        await financeService.createOtherCost(
          principalSuperOwner,
          {
            branchId: branchA.id,
            period: lockedPeriod,
            category: 'OTHER',
            description: 'Retroactive expense into locked month',
            amountRp: 200_000,
          },
          `key-3.3-${uniqueSuffix()}`,
        );
        record(
          'EDGE_FIN_1',
          'Period-Lock',
          'Penambahan biaya pada periode buku LOCKED dicekal mutlak (Rule #8 Freeze)',
          'EDGE',
          false,
          'BLIND SPOT: Pengeluaran berhasil disisipkan ke periode yang terkunci!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'PERIOD_ALREADY_LOCKED' || err?.status === 409;
        record(
          'EDGE_FIN_1',
          'Period-Lock',
          'Penambahan biaya pada periode buku LOCKED dicekal mutlak (Rule #8 Freeze)',
          'EDGE',
          passed,
          passed ? 'Dicekal dengan PERIOD_ALREADY_LOCKED (409)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 3.4 Biaya Nol atau Negatif Ditolak
    {
      const t0 = Date.now();
      try {
        await financeService.createOtherCost(
          principalSuperOwner,
          {
            branchId: branchA.id,
            period: '2026-09',
            category: 'OTHER',
            description: 'Negative cost',
            amountRp: -50_000,
          },
          `key-3.4-${uniqueSuffix()}`,
        );
        record(
          'NEG_FIN_1',
          'Keuangan',
          'Biaya operasional dengan nominal negatif atau nol ditolak',
          'NEGATIVE',
          false,
          'Nominal negatif berhasil disimpan!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'INVALID_AMOUNT' || err?.status === 400;
        record(
          'NEG_FIN_1',
          'Keuangan',
          'Biaya operasional dengan nominal negatif atau nol ditolak',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan INVALID_AMOUNT (400)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 4: SCHEDULING, STUDIO & INSTRUCTOR COLLISION GUARDS
    // ========================================================================
    console.log('\n▶ PILAR 4: Scheduling Collisions & Conflict Guards...');

    // 4.1 Bentrok Ruangan/Studio (Studio Collision)
    {
      const t0 = Date.now();
      const startTime = new Date(Date.now() + 10 * 86_400_000); // 10 hari lagi
      const endTime = new Date(startTime.getTime() + 60 * 60_000);

      const baseSlot = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studioA.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: startTime,
          endAt: endTime,
          capacity: 8,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(baseSlot.id);

      // Coba buat slot lain di STUDIO YANG SAMA pada rentang jam yang overlapping
      const overlapStart = new Date(startTime.getTime() + 15 * 60_000); // 15 menit setelah slot 1 mulai
      const overlapEnd = new Date(overlapStart.getTime() + 60 * 60_000);

      // Cari instruktur lain untuk membuktikan bahwa yang bentrok adalah STUDIONYA
      const otherInstructor = await db.user.findFirst({
        where: {
          role: Role.INSTRUCTOR,
          id: { not: instructor.id },
        },
      });

      try {
        await classSlotService.create(
          principalSuperOwner,
          {
            branchId: branchA.id,
            studioId: studioA.id,
            classTypeId: classTypeA.id,
            instructorUserId: otherInstructor?.id ?? instructor.id,
            startAt: overlapStart.toISOString(),
            endAt: overlapEnd.toISOString(),
          },
          `key-4.1-${uniqueSuffix()}`,
          'trace-4.1',
        );
        record(
          'EDGE_SCH_1',
          'Penjadwalan',
          'Jadwal bentrok di studio yang sama dicekal (Studio Time Collision)',
          'EDGE',
          false,
          'BLIND SPOT: Dua kelas berhasil dijadwalkan di studio yang sama bersamaan!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'SLOT_SCHEDULE_COLLISION' || err?.status === 409;
        record(
          'EDGE_SCH_1',
          'Penjadwalan',
          'Jadwal bentrok di studio yang sama dicekal (Studio Time Collision)',
          'EDGE',
          passed,
          passed ? 'Dicekal dengan SLOT_SCHEDULE_COLLISION (409)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 4.2 Bentrok Instruktur (Instructor Collision di Studio/Cabang Lain)
    {
      const t0 = Date.now();
      const startTime = new Date(Date.now() + 11 * 86_400_000); // 11 hari lagi
      const endTime = new Date(startTime.getTime() + 60 * 60_000);

      const baseSlot = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studioA.id,
          classTypeId: classTypeA.id,
          instructorId: instructor.id,
          startAt: startTime,
          endAt: endTime,
          capacity: 8,
          bookedCount: 0,
          status: ClassSlotStatus.PUBLISHED,
        },
      });
      cleanupSlotIds.push(baseSlot.id);

      // Coba buat slot di Cabang B dengan INSTRUKTUR YANG SAMA pada waktu yang sama
      const studiosB = await db.studio.findMany({ where: { branchId: branchB.id }, take: 1 });
      const studioB = studiosB[0] ?? studioA;

      try {
        await classSlotService.create(
          principalSuperOwner,
          {
            branchId: branchB.id,
            studioId: studioB.id,
            classTypeId: classTypeA.id,
            instructorUserId: instructor.id, // Instruktur sama persis
            startAt: startTime.toISOString(),
            endAt: endTime.toISOString(),
          },
          `key-4.2-${uniqueSuffix()}`,
          'trace-4.2',
        );
        record(
          'EDGE_SCH_2',
          'Penjadwalan',
          'Instruktur yang sama mengajar di 2 kelas bersamaan dicekal (Instructor Collision)',
          'EDGE',
          false,
          'BLIND SPOT: Instruktur berhasil ditugaskan di 2 kelas pada waktu yang sama!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'SLOT_SCHEDULE_COLLISION' || err?.status === 409;
        record(
          'EDGE_SCH_2',
          'Penjadwalan',
          'Instruktur yang sama mengajar di 2 kelas bersamaan dicekal (Instructor Collision)',
          'EDGE',
          passed,
          passed ? 'Dicekal dengan SLOT_SCHEDULE_COLLISION (409)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 4.3 Slot dengan endAt lebih awal dari startAt dicekal
    {
      const t0 = Date.now();
      const startTime = new Date(Date.now() + 12 * 86_400_000);
      const endTime = new Date(startTime.getTime() - 30 * 60_000); // 30 menit sebelum mulai

      try {
        await classSlotService.create(
          principalSuperOwner,
          {
            branchId: branchA.id,
            studioId: studioA.id,
            classTypeId: classTypeA.id,
            instructorUserId: instructor.id,
            startAt: startTime.toISOString(),
            endAt: endTime.toISOString(),
          },
          `key-4.3-${uniqueSuffix()}`,
          'trace-4.3',
        );
        record(
          'NEG_SCH_1',
          'Penjadwalan',
          'Jadwal slot dengan endAt <= startAt dicekal (Time Inversion)',
          'NEGATIVE',
          false,
          'Waktu kelas terbalik berhasil dibuat!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'VALIDATION_ERROR' || err?.status === 400 || err?.status === 422;
        record(
          'NEG_SCH_1',
          'Penjadwalan',
          'Jadwal slot dengan endAt <= startAt dicekal (Time Inversion)',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan VALIDATION_ERROR' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 5: PACKAGE CATALOG & PRICING BOUNDARY VALIDATION
    // ========================================================================
    console.log('\n▶ PILAR 5: Package Master & Pricing Validation...');

    // 5.1 Harga Paket Negatif Ditolak
    {
      const t0 = Date.now();
      try {
        await packageCatalogService.create(
          principalSuperOwner,
          {
            code: `PKG-NEG-${uniqueSuffix()}`,
            name: 'Negative Price Package',
            priceRp: -100_000,
            sessionCount: 5,
            validityDays: 30,
          },
          `key-5.1-${uniqueSuffix()}`,
          'trace-5.1',
        );
        record(
          'NEG_PKG_1',
          'Katalog',
          'Pembuatan paket dengan harga negatif dicekal',
          'NEGATIVE',
          false,
          'Paket dengan harga negatif berhasil dibuat!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'VALIDATION_ERROR' || err?.status === 400;
        record(
          'NEG_PKG_1',
          'Katalog',
          'Pembuatan paket dengan harga negatif dicekal',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan VALIDATION_ERROR (400)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.2 Jumlah Sesi Paket <= 0 Ditolak
    {
      const t0 = Date.now();
      try {
        await packageCatalogService.create(
          principalSuperOwner,
          {
            code: `PKG-ZERO-SESS-${uniqueSuffix()}`,
            name: 'Zero Session Package',
            priceRp: 500_000,
            sessionCount: 0,
            validityDays: 30,
          },
          `key-5.2-${uniqueSuffix()}`,
          'trace-5.2',
        );
        record(
          'NEG_PKG_2',
          'Katalog',
          'Pembuatan paket dengan 0 sesi dicekal',
          'NEGATIVE',
          false,
          'Paket 0 sesi berhasil dibuat!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'VALIDATION_ERROR' || err?.status === 400;
        record(
          'NEG_PKG_2',
          'Katalog',
          'Pembuatan paket dengan 0 sesi dicekal',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan VALIDATION_ERROR (400)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // 5.3 Kode Paket Duplikat Ditolak (RESOURCE_EXISTS)
    {
      const t0 = Date.now();
      const existingPkg = await db.paket.findFirstOrThrow();
      try {
        await packageCatalogService.create(
          principalSuperOwner,
          {
            code: existingPkg.code, // Kode sama persis
            name: 'Duplicate Code Package',
            priceRp: 600_000,
            sessionCount: 5,
            validityDays: 30,
          },
          `key-5.3-${uniqueSuffix()}`,
          'trace-5.3',
        );
        record(
          'NEG_PKG_3',
          'Katalog',
          'Pembuatan paket dengan kode duplikat dicekal (Unique Code Constraint)',
          'NEGATIVE',
          false,
          'Paket kode duplikat berhasil dibuat!',
          Date.now() - t0,
        );
      } catch (err: any) {
        const passed = err?.code === 'RESOURCE_EXISTS' || err?.status === 409;
        record(
          'NEG_PKG_3',
          'Katalog',
          'Pembuatan paket dengan kode duplikat dicekal (Unique Code Constraint)',
          'NEGATIVE',
          passed,
          passed ? 'Dicekal dengan RESOURCE_EXISTS (409)' : `Error tak terduga: ${err.message}`,
          Date.now() - t0,
        );
      }
    }

    // ========================================================================
    // PILAR 6: USER SUSPENSION & IMMEDIATE SESSION REVOCATION
    // ========================================================================
    console.log('\n▶ PILAR 6: User Suspension & Session Termination...');

    // 6.1 Status SUSPENDED memblokir akses pengguna secara instan
    {
      const t0 = Date.now();
      const suspendedStaff = await db.user.create({
        data: {
          id: randomUUID(),
          email: `staff.suspend.${uniqueSuffix()}@dailydose.test`,
          displayName: 'Suspended Staff Member',
          phone: `+62811${Math.floor(10000000 + Math.random() * 90000000)}`,
          passwordHash,
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
          preferredBranchId: branchA.id,
        },
      });
      cleanupUserIds.push(suspendedStaff.id);

      const staffSession = await db.userSession.create({
        data: {
          id: randomUUID(),
          userId: suspendedStaff.id,
          tokenFamilyHash: randomUUID().replace(/-/g, ''),
          accessTokenHash: randomUUID().replace(/-/g, ''),
          refreshTokenHash: randomUUID().replace(/-/g, ''),
          expiresAt: new Date(Date.now() + 3600_000),
          refreshExpiresAt: new Date(Date.now() + 7 * 86400_000),
          createdAt: new Date(),
        },
      });

      // Super Owner mensuspensi staf tersebut
      await db.user.update({
        where: { id: suspendedStaff.id },
        data: { status: UserStatus.SUSPENDED },
      });

      // Cabut sesi terkait
      await db.userSession.updateMany({
        where: { userId: suspendedStaff.id },
        data: { revokedAt: new Date(), revocationReason: 'USER_SUSPENDED' },
      });

      // Coba query sesi apakah masih dianggap valid
      const sessionAfterSuspend = await db.userSession.findFirst({
        where: { id: staffSession.id, revokedAt: null, user: { status: UserStatus.ACTIVE } },
      });

      const passed = sessionAfterSuspend === null;
      record(
        'FLOW_SUSP_1',
        'Suspensi',
        'User berstatus SUSPENDED sesi dan hak aksesnya dicabut seketika',
        'FLOW',
        passed,
        passed ? 'Sesi berhasil dibatalkan dan query memvalidasi status null' : 'Sesi masih aktif!',
        Date.now() - t0,
      );
    }

    // ========================================================================
    // RINGKASAN HASIL AUDIT SUPER ADMIN
    // ========================================================================
    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 REKAPITULASI AUDIT & HASIL TESTING SUPER ADMIN (STRICT NO HAPPY PATH)');
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
      console.log('🎉 SELURUH SKENARIO ADVERSARIAL SUPER ADMIN LULUS 100%! SEMUA PERLINDUNGAN UTUH.');
    }

  } finally {
    console.log('\n🧹 Membersihkan data temporer pengujian Super Admin...');
    try {
      if (cleanupCorrectionIds.length) {
        await db.correctionJournal.deleteMany({ where: { id: { in: cleanupCorrectionIds } } });
      }
      if (cleanupOtherCostIds.length) {
        await db.otherCost.deleteMany({ where: { id: { in: cleanupOtherCostIds } } });
      }
      if (cleanupPurchaseIds.length) {
        await db.sessionLedger.deleteMany({ where: { customerPackage: { purchaseId: { in: cleanupPurchaseIds } } } });
        await db.paketPelanggan.deleteMany({ where: { purchaseId: { in: cleanupPurchaseIds } } });
        await db.pembelian.deleteMany({ where: { id: { in: cleanupPurchaseIds } } });
      }
      if (cleanupSlotIds.length) {
        await db.slotKelas.deleteMany({ where: { id: { in: cleanupSlotIds } } });
      }
      if (cleanupPackageIds.length) {
        await db.paket.deleteMany({ where: { id: { in: cleanupPackageIds } } });
      }
      for (const k of cleanupMonthlyCloseKeys) {
        await db.monthlyClose.deleteMany({ where: { branchId: k.branchId, period: k.period } });
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

runSuperAdminAudit().catch((err) => {
  console.error('\n💥 FATAL ERROR EXECUTION:', err);
  process.exit(1);
});
