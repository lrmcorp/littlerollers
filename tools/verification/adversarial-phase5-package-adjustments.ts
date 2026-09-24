import { PrismaClient, Role, PurchaseStatus, AdjustRequestStatus, SessionMutationType } from '@prisma/client';
import { randomBytes, randomUUID } from 'node:crypto';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { AuditService } from '../../apps/api/src/foundation/audit.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';
import { PackageAccessService } from '../../apps/api/src/packages/package-access.service';
import { PackagePricingService } from '../../apps/api/src/packages/kalkulasi-harga-paket.service';
import { VoucherService } from '../../apps/api/src/packages/voucher.service';
import { CustomerOrderService } from '../../apps/api/src/packages/pembelian-paket.service';
import { PaymentProofService } from '../../apps/api/src/packages/bukti-pembayaran.service';
import { PaymentReviewService } from '../../apps/api/src/packages/verifikasi-pembayaran.service';
import { SessionAdjustService } from '../../apps/api/src/bookings/session-adjust.service';

interface TestResult {
  code: string;
  name: string;
  pillar: string;
  passed: boolean;
  reason?: string;
  durationMs: number;
}

const results: TestResult[] = [];

function recordResult(
  code: string,
  name: string,
  pillar: string,
  passed: boolean,
  reason = '',
  durationMs = 0,
) {
  results.push({ code, name, pillar, passed, reason, durationMs });
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`   ${statusIcon} [${code}] ${name} (${durationMs}ms)`);
  if (!passed && reason) {
    console.error(`      ⚠️ Detail Kegagalan: ${reason}`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - UJI ADVERSARIAL TAHAP 5: PERSETUJUAN PAKET & PENYESUAIAN     ║');
  console.log('║   "Approval SoD & Manager Gate (Aturan #2)" — STRICT NO HAPPY PATH           ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const policy = new PolicyService();
  const idempotency = new IdempotencyService(db as any);
  const auditService = new AuditService();
  const runtimeConfig = {
    value: {
      quotaEvaluation: { maxAttempts: 5 },
      booking: { enabled: true, cutoffHours: 2 },
      bookingCancellation: { enabled: true, cutoffHours: 24 },
    },
  } as any;

  const packageAccess = new PackageAccessService(db as any, policy, auditService);
  const pricing = new PackagePricingService();
  const vouchers = new VoucherService(db as any, packageAccess, pricing, idempotency);

  const customerOrderService = new CustomerOrderService(
    db as any,
    packageAccess,
    pricing,
    vouchers,
    idempotency,
    runtimeConfig,
    auditService,
  );

  const paymentProofService = new PaymentProofService(
    db as any,
    packageAccess,
    runtimeConfig,
    auditService,
  );

  const paymentReviewService = new PaymentReviewService(
    db as any,
    idempotency,
    packageAccess,
  );

  const sessionAdjustService = new SessionAdjustService(db as any);

  const cleanupPurchaseIds: string[] = [];
  const cleanupPaymentProofIds: string[] = [];
  const cleanupCustomerPackageIds: string[] = [];
  const cleanupUserIds: string[] = [];
  const cleanupAdjustRequestIds: string[] = [];
  const cleanupMasterPackageIds: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // 1. Menyiapkan Aktor Uji & Cabang
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor Uji (Customer, Admin, Manager Cabang A & B)...');
    const branches = await db.cabang.findMany({ where: { active: true }, take: 2 });
    if (branches.length < 2) {
      throw new Error('Dibutuhkan minimal 2 cabang untuk pengujian isolasi cabang!');
    }
    const branchA = branches[0];
    const branchB = branches[1];

    const defaultClassType = await db.jenisKelas.findFirstOrThrow();

    // Helper membuat customer
    async function createTestCustomer(tag: string, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE'): Promise<{
      user: any;
      principal: SessionPrincipal;
    }> {
      const email = `adv5.${tag}.${randomBytes(3).toString('hex')}@dailydose.test`;
      const user = await db.user.create({
        data: {
          email,
          displayName: `Adv5 Customer ${tag}`,
          phone: `+62895${Math.floor(10000000 + Math.random() * 90000000)}`,
          role: Role.CUSTOMER,
          status,
        },
      });
      cleanupUserIds.push(user.id);

      const principal: SessionPrincipal = {
        sessionId: `sess-${tag}-${randomUUID().slice(0, 6)}`,
        userId: user.id,
        roles: [{ role: 'CUSTOMER', branchId: null }],
        capabilities: ['customer:self', 'package:read', 'payment-proof:replace'],
        branchIds: [],
      };
      return { user, principal };
    }

    // Helper membuat paket master
    async function createMasterPackage(tag: string, sessionCount = 8, active = true) {
      const pkg = await db.paket.create({
        data: {
          id: randomUUID(),
          classTypeId: defaultClassType.id,
          code: `PKG-${tag.toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`,
          name: `Paket Test ${tag}`,
          sessionCount,
          validityDays: 30,
          priceRp: 1_200_000,
          status: active ? 'ACTIVE' : 'INACTIVE',
        },
      });
      cleanupMasterPackageIds.push(pkg.id);
      return pkg;
    }

    // Admin Cabang A (hanya punya payment:review & purchase:review, TIDAK PUNYA payment:decide)
    const adminUser = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const adminPrincipalA: SessionPrincipal = {
      sessionId: `sess-adm-a-${randomUUID().slice(0, 6)}`,
      userId: adminUser.id,
      roles: [{ role: 'ADMIN', branchId: branchA.id }],
      capabilities: [
        'customer:read',
        'customer:manage',
        'payment:review',
        'purchase:review',
        'ledger:read',
        'ledger:adjust:read',
        'ledger:adjust:request',
      ],
      branchIds: [branchA.id],
    };

    // Manager Cabang A (punya payment:decide & purchase:decide & ledger:adjust:decide)
    let managerA = await db.user.findFirst({
      where: { role: Role.MANAGER, preferredBranchId: branchA.id },
    });
    if (!managerA) {
      managerA = await db.user.create({
        data: {
          email: `manager.a.${Date.now()}@dailydose.test`,
          displayName: 'Manager Branch A',
          phone: '+628111222333',
          role: Role.MANAGER,
          status: 'ACTIVE',
          preferredBranchId: branchA.id,
        },
      });
      cleanupUserIds.push(managerA.id);
    }
    const managerPrincipalA: SessionPrincipal = {
      sessionId: `sess-mgr-a-${randomUUID().slice(0, 6)}`,
      userId: managerA.id,
      roles: [{ role: 'MANAGER', branchId: branchA.id }],
      capabilities: [
        'branch:manage',
        'payment:review',
        'payment:decide',
        'purchase:review',
        'purchase:decide',
        'ledger:read',
        'ledger:adjust:read',
        'ledger:adjust:decide',
      ],
      branchIds: [branchA.id],
    };

    // Manager Cabang B
    let managerB = await db.user.findFirst({
      where: { role: Role.MANAGER, preferredBranchId: branchB.id },
    });
    if (!managerB) {
      managerB = await db.user.create({
        data: {
          email: `manager.b.${Date.now()}@dailydose.test`,
          displayName: 'Manager Branch B',
          phone: '+628111222444',
          role: Role.MANAGER,
          status: 'ACTIVE',
          preferredBranchId: branchB.id,
        },
      });
      cleanupUserIds.push(managerB.id);
    }
    const managerPrincipalB: SessionPrincipal = {
      sessionId: `sess-mgr-b-${randomUUID().slice(0, 6)}`,
      userId: managerB.id,
      roles: [{ role: 'MANAGER', branchId: branchB.id }],
      capabilities: [
        'branch:manage',
        'payment:review',
        'payment:decide',
        'purchase:review',
        'purchase:decide',
        'ledger:read',
        'ledger:adjust:read',
        'ledger:adjust:decide',
      ],
      branchIds: [branchB.id],
    };

    console.log(`   Cabang A: ${branchA.name}, Cabang B: ${branchB.name}`);
    console.log(`   Admin Cabang A: ${adminUser.displayName}`);
    console.log(`   Manager Cabang A: ${managerA.displayName}`);
    console.log(`   Manager Cabang B: ${managerB.displayName}\n`);

    // ========================================================================
    // PILAR A: PEMBELIAN PAKET & VALIDASI BUKTI BAYAR
    // ========================================================================
    console.log('▶ 2. PILAR A: Pembelian Paket & Validasi Bukti Bayar (No Happy Path)...');

    // TEST 5.A1: Malformed / Empty Payment Proof File Validation
    {
      const start = Date.now();
      let rejected = false;
      let reason = '';
      try {
        const { principal: custPrincipal } = await createTestCustomer('5a1');
        await paymentProofService.issue(
          custPrincipal,
          {
            branchId: branchA.id,
            fileName: '',
            mimeType: '',
            sizeBytes: 0, // ukuran 0 bytes dilarang
          },
          'corr-test',
        );
      } catch (err: any) {
        if (err?.code === 'VALIDATION_ERROR' || err?.message?.includes('VALIDATION_ERROR')) {
          rejected = true;
          reason = 'VALIDATION_ERROR (Empty filename / mime / 0 bytes blocked)';
        } else {
          reason = err?.message || err?.code;
        }
      }
      recordResult(
        'TEST_5A1',
        'Malformed / Empty Payment Proof File Validation (0 Bytes / Empty Fields -> VALIDATION_ERROR)',
        'Pilar A: Pembelian Paket',
        rejected,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.A2: Unverified Customer Purchase Gate (KYC Incomplete -> Blocked)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const { principal: unverifiedCust } = await createTestCustomer('5a2', 'INACTIVE');
        const masterPkg = await createMasterPackage('5a2');

        await customerOrderService.createOrder(
          unverifiedCust,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-unv-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        if (
          err?.code === 'IDENTITY_VERIFICATION_REQUIRED' ||
          err?.message?.includes('IDENTITY_VERIFICATION_REQUIRED')
        ) {
          blocked = true;
          reason = 'IDENTITY_VERIFICATION_REQUIRED (Customer unverified KYC blocked)';
        } else {
          reason = err?.message || err?.code;
        }
      }
      recordResult(
        'TEST_5A2',
        'Unverified Customer Purchase Gate (KYC Incomplete -> IDENTITY_VERIFICATION_REQUIRED)',
        'Pilar A: Pembelian Paket',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.A3: Inactive / Ghost Master Package Purchase Blockade
    {
      const start = Date.now();
      let blockedInactive = false;
      let blockedGhost = false;
      let reason = '';
      try {
        const { principal: custPrincipal } = await createTestCustomer('5a3');
        const inactivePkg = await createMasterPackage('5a3-inact', 10, false);

        // A. Coba beli paket yang statusnya INACTIVE
        try {
          await customerOrderService.createOrder(
            custPrincipal,
            {
              packageId: inactivePkg.id,
              branchId: branchA.id,
            },
            `key-order-inact-${Date.now()}`,
            'corr-test',
          );
        } catch (err: any) {
          if (err?.code === 'RESOURCE_NOT_FOUND' || err?.message?.includes('RESOURCE_NOT_FOUND')) {
            blockedInactive = true;
          }
        }

        // B. Coba beli paket dengan UUID hantu
        try {
          await customerOrderService.createOrder(
            custPrincipal,
            {
              packageId: randomUUID(),
              branchId: branchA.id,
            },
            `key-order-ghost-${Date.now()}`,
            'corr-test',
          );
        } catch (err: any) {
          if (err?.code === 'RESOURCE_NOT_FOUND' || err?.message?.includes('RESOURCE_NOT_FOUND')) {
            blockedGhost = true;
          }
        }

        reason = `Blocked Inactive = ${blockedInactive}, Blocked Ghost = ${blockedGhost}`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5A3',
        'Inactive / Ghost Master Package Purchase Blockade (RESOURCE_NOT_FOUND -> 404)',
        'Pilar A: Pembelian Paket',
        blockedInactive && blockedGhost,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.A4: IDOR Attack on Payment Proof Attachment
    {
      const start = Date.now();
      let blockedIdor = false;
      let reason = '';
      try {
        const { user: custUserA, principal: custA } = await createTestCustomer('5a4-a');
        const { user: custUserB, principal: custB } = await createTestCustomer('5a4-b');
        const masterPkg = await createMasterPackage('5a4');

        // Customer A membuat pesanan
        const orderResA = await customerOrderService.createOrder(
          custA,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-5a4-${Date.now()}`,
          'corr-test',
        );
        const orderIdA = (orderResA.body as any).id;
        cleanupPurchaseIds.push(orderIdA);

        // Customer B mencoba melampirkan bukti bayar ke pesanan milik Customer A
        try {
          await customerOrderService.attachOrderProof(
            custB,
            orderIdA,
            { bankName: 'BCA', accountHolder: 'Hacker B' },
            'corr-test',
          );
        } catch (err: any) {
          if (err?.code === 'RESOURCE_NOT_FOUND' || err?.message?.includes('RESOURCE_NOT_FOUND')) {
            blockedIdor = true;
            reason = 'RESOURCE_NOT_FOUND (IDOR on attachOrderProof blocked)';
          }
        }
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5A4',
        'IDOR Attack on Payment Proof Attachment (Customer B attaches to Customer A -> 404)',
        'Pilar A: Pembelian Paket',
        blockedIdor,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR B: PERSETUJUAN PEMBAYARAN & SEPARATION OF DUTIES (ATURAN #2)
    // ========================================================================
    console.log('\n▶ 3. PILAR B: Persetujuan Pembayaran & Separation of Duties (Aturan Bisnis #2)...');

    // TEST 5.B1: Self-Approval Prohibition (Separation of Duties - SoD)
    {
      const start = Date.now();
      let blockedSoD = false;
      let reason = '';
      try {
        const masterPkg = await createMasterPackage('5b1');
        // Manager A membuat pesanan untuk dirinya sendiri
        const orderRes = await customerOrderService.createOrder(
          managerPrincipalA,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-mgr-self-${Date.now()}`,
          'corr-test',
        );
        const purchaseId = (orderRes.body as any).id;
        cleanupPurchaseIds.push(purchaseId);

        // Manager A mencoba meng-approve pembelian miliknya sendiri
        try {
          await paymentReviewService.decide(
            managerPrincipalA,
            purchaseId,
            'APPROVED',
            { reasonCode: 'PAYMENT_VERIFIED' },
            `key-approve-self-${Date.now()}`,
            'corr-test',
          );
        } catch (err: any) {
          if (
            err?.code === 'SEPARATION_OF_DUTIES_VIOLATION' ||
            err?.message?.includes('SEPARATION_OF_DUTIES_VIOLATION')
          ) {
            blockedSoD = true;
            reason = 'SEPARATION_OF_DUTIES_VIOLATION (Self-approval strictly forbidden)';
          }
        }
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5B1',
        'Self-Approval Prohibition (Separation of Duties -> SEPARATION_OF_DUTIES_VIOLATION)',
        'Pilar B: SoD Approval',
        blockedSoD,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.B2: Admin Unauthorized Approval Escalation
    {
      const start = Date.now();
      let blockedAdmin = false;
      let reason = '';
      try {
        const { principal: custPrincipal } = await createTestCustomer('5b2');
        const masterPkg = await createMasterPackage('5b2');

        const orderRes = await customerOrderService.createOrder(
          custPrincipal,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-5b2-${Date.now()}`,
          'corr-test',
        );
        const purchaseId = (orderRes.body as any).id;
        cleanupPurchaseIds.push(purchaseId);

        // Admin A (tanpa payment:decide) mencoba meng-approve pembelian
        try {
          await paymentReviewService.decide(
            adminPrincipalA,
            purchaseId,
            'APPROVED',
            { reasonCode: 'PAYMENT_VERIFIED' },
            `key-adm-approve-${Date.now()}`,
            'corr-test',
          );
        } catch (err: any) {
          if (err?.code === 'FORBIDDEN' || err?.message?.includes('FORBIDDEN')) {
            blockedAdmin = true;
            reason = 'FORBIDDEN (Admin without payment:decide blocked from approving)';
          }
        }
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5B2',
        'Admin Unauthorized Approval Escalation (Admin without payment:decide -> FORBIDDEN)',
        'Pilar B: SoD Approval',
        blockedAdmin,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.B3: Cross-Branch Manager Approval Blockade
    {
      const start = Date.now();
      let blockedCrossBranch = false;
      let reason = '';
      try {
        const { principal: custPrincipal } = await createTestCustomer('5b3');
        const masterPkg = await createMasterPackage('5b3');

        // Pesanan dibuat untuk Cabang A
        const orderRes = await customerOrderService.createOrder(
          custPrincipal,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-5b3-${Date.now()}`,
          'corr-test',
        );
        const purchaseId = (orderRes.body as any).id;
        cleanupPurchaseIds.push(purchaseId);

        // Manager Cabang B mencoba meng-approve pesanan Cabang A
        try {
          await paymentReviewService.decide(
            managerPrincipalB,
            purchaseId,
            'APPROVED',
            { reasonCode: 'PAYMENT_VERIFIED' },
            `key-mgr-b-approve-${Date.now()}`,
            'corr-test',
          );
        } catch (err: any) {
          if (err?.code === 'RESOURCE_NOT_FOUND' || err?.message?.includes('RESOURCE_NOT_FOUND')) {
            blockedCrossBranch = true;
            reason = 'RESOURCE_NOT_FOUND (Cross-branch manager approval blocked)';
          }
        }
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5B3',
        'Cross-Branch Manager Approval Blockade (Manager B approves Branch A -> 404)',
        'Pilar B: SoD Approval',
        blockedCrossBranch,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.B4: Re-Decide on Already Decided Purchase Blockade
    {
      const start = Date.now();
      let blockedReDecide = false;
      let reason = '';
      try {
        const { principal: custPrincipal } = await createTestCustomer('5b4');
        const masterPkg = await createMasterPackage('5b4');

        const orderRes = await customerOrderService.createOrder(
          custPrincipal,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-5b4-${Date.now()}`,
          'corr-test',
        );
        const purchaseId = (orderRes.body as any).id;
        cleanupPurchaseIds.push(purchaseId);

        // 1. Approve pertama kali oleh Manager A (Sah)
        await paymentReviewService.decide(
          managerPrincipalA,
          purchaseId,
          'APPROVED',
          { reasonCode: 'PAYMENT_VERIFIED' },
          `key-app-1-${Date.now()}`,
          'corr-test',
        );

        // 2. Coba approve kedua kali dengan idempotency key berbeda
        try {
          await paymentReviewService.decide(
            managerPrincipalA,
            purchaseId,
            'APPROVED',
            { reasonCode: 'PAYMENT_VERIFIED' },
            `key-app-2-diff-${Date.now()}`,
            'corr-test',
          );
        } catch (err: any) {
          if (
            err?.code === 'PURCHASE_ALREADY_DECIDED' ||
            err?.message?.includes('PURCHASE_ALREADY_DECIDED')
          ) {
            blockedReDecide = true;
            reason = 'PURCHASE_ALREADY_DECIDED (State transition from PAID to PAID blocked)';
          }
        }
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5B4',
        'Re-Decide on Already Decided Purchase Blockade (PAID -> PURCHASE_ALREADY_DECIDED)',
        'Pilar B: SoD Approval',
        blockedReDecide,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR C: AKTIVASI KUOTA SESI & AUDIT TRAIL SESSIONLEDGER
    // ========================================================================
    console.log('\n▶ 4. PILAR C: Aktivasi Kuota Sesi & Audit Trail SessionLedger (Aturan Bisnis #2)...');

    // TEST 5.C1: Initial Session Credit & SessionLedger Creation on Approve
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const { user: custUser, principal: custPrincipal } = await createTestCustomer('5c1');
        const masterPkg = await createMasterPackage('5c1', 8);

        const orderRes = await customerOrderService.createOrder(
          custPrincipal,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-5c1-${Date.now()}`,
          'corr-test',
        );
        const purchaseId = (orderRes.body as any).id;
        cleanupPurchaseIds.push(purchaseId);

        // Manager A approve pembelian
        await paymentReviewService.decide(
          managerPrincipalA,
          purchaseId,
          'APPROVED',
          { reasonCode: 'PAYMENT_VERIFIED' },
          `key-app-5c1-${Date.now()}`,
          'corr-test',
        );

        // Verifikasi database PaketPelanggan
        const custPkg = await db.paketPelanggan.findFirst({
          where: { purchaseId, userId: custUser.id },
        });
        if (custPkg) cleanupCustomerPackageIds.push(custPkg.id);

        // Verifikasi SessionLedger
        const ledgerEntries = custPkg
          ? await db.sessionLedger.findMany({
              where: { customerPackageId: custPkg.id },
            })
          : [];

        const hasPurchaseLedger = ledgerEntries.some(
          (l) => l.type === SessionMutationType.PURCHASE && l.amount === 8 && l.balanceAfter === 8,
        );

        success =
          custPkg !== null &&
          custPkg.status === 'ACTIVE' &&
          custPkg.remainingSessions === 8 &&
          custPkg.totalSessions === 8 &&
          hasPurchaseLedger;

        reason = `CustPkg active: ${custPkg?.status}, Remaining: ${custPkg?.remainingSessions}, Ledger PURCHASE amount: 8, balanceAfter: 8`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5C1',
        'Initial Session Credit & SessionLedger Creation on Approve (Rule #2: 8 Sesi & PURCHASE Entry)',
        'Pilar C: Aktivasi Kuota Sesi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.C2: Idempotent Replay on Purchase Approval
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const { user: custUser, principal: custPrincipal } = await createTestCustomer('5c2');
        const masterPkg = await createMasterPackage('5c2', 10);

        const orderRes = await customerOrderService.createOrder(
          custPrincipal,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-5c2-${Date.now()}`,
          'corr-test',
        );
        const purchaseId = (orderRes.body as any).id;
        cleanupPurchaseIds.push(purchaseId);

        const idemKey = `key-idem-app-${Date.now()}`;

        // Approval 1
        const res1 = await paymentReviewService.decide(
          managerPrincipalA,
          purchaseId,
          'APPROVED',
          { reasonCode: 'PAYMENT_VERIFIED' },
          idemKey,
          'corr-test',
        );

        // Approval 2 (Replay dengan key yang sama)
        const res2 = await paymentReviewService.decide(
          managerPrincipalA,
          purchaseId,
          'APPROVED',
          { reasonCode: 'PAYMENT_VERIFIED' },
          idemKey,
          'corr-test',
        );

        const packageCount = await db.paketPelanggan.count({
          where: { purchaseId },
        });

        success = res1.replay === false && res2.replay === true && packageCount === 1;
        reason = `Approve 1 replay: ${res1.replay}, Approve 2 replay: ${res2.replay}, Package Count: ${packageCount}`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5C2',
        'Idempotent Replay on Purchase Approval (Replay Handled & Zero Duplicate Packages)',
        'Pilar C: Aktivasi Kuota Sesi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.C3: Rejection Reason Requirement & Validation
    {
      const start = Date.now();
      let blockedInvalidReason = false;
      let blockedEmptyNote = false;
      let reason = '';
      try {
        const { principal: custPrincipal } = await createTestCustomer('5c3');
        const masterPkg = await createMasterPackage('5c3');

        const orderRes = await customerOrderService.createOrder(
          custPrincipal,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-5c3-${Date.now()}`,
          'corr-test',
        );
        const purchaseId = (orderRes.body as any).id;
        cleanupPurchaseIds.push(purchaseId);

        // A. Reject dengan reasonCode fiktif
        try {
          await paymentReviewService.decide(
            managerPrincipalA,
            purchaseId,
            'REJECTED',
            { reasonCode: 'INVALID_REASON_CODE' },
            `key-rej-inv-${Date.now()}`,
            'corr-test',
          );
        } catch (err: any) {
          if (err?.code === 'VALIDATION_ERROR' || err?.message?.includes('VALIDATION_ERROR')) {
            blockedInvalidReason = true;
          }
        }

        // B. Reject dengan OTHER_REVIEW_REQUIRED tetapi catatan kosong / <3 karakter
        try {
          await paymentReviewService.decide(
            managerPrincipalA,
            purchaseId,
            'REJECTED',
            { reasonCode: 'OTHER_REVIEW_REQUIRED', note: 'x' },
            `key-rej-short-${Date.now()}`,
            'corr-test',
          );
        } catch (err: any) {
          if (err?.code === 'VALIDATION_ERROR' || err?.message?.includes('VALIDATION_ERROR')) {
            blockedEmptyNote = true;
          }
        }

        reason = `Blocked Invalid Code = ${blockedInvalidReason}, Blocked Short Note = ${blockedEmptyNote}`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5C3',
        'Rejection Reason Requirement & Validation (Invalid Code / Short Note -> VALIDATION_ERROR)',
        'Pilar C: Aktivasi Kuota Sesi',
        blockedInvalidReason && blockedEmptyNote,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.C4: Zero Quota Leakage on Rejected Purchase
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const { user: custUser, principal: custPrincipal } = await createTestCustomer('5c4');
        const masterPkg = await createMasterPackage('5c4', 12);

        const orderRes = await customerOrderService.createOrder(
          custPrincipal,
          {
            packageId: masterPkg.id,
            branchId: branchA.id,
          },
          `key-order-5c4-${Date.now()}`,
          'corr-test',
        );
        const purchaseId = (orderRes.body as any).id;
        cleanupPurchaseIds.push(purchaseId);

        // Manager A me-reject pesanan secara sah
        await paymentReviewService.decide(
          managerPrincipalA,
          purchaseId,
          'REJECTED',
          { reasonCode: 'PROOF_INVALID', note: 'Bukti transfer buram tidak terbaca' },
          `key-rej-5c4-${Date.now()}`,
          'corr-test',
        );

        // Verifikasi database: tidak ada paket yang aktif dan tidak ada sesi yang terbit
        const activePackages = await db.paketPelanggan.findMany({
          where: { userId: custUser.id, status: 'ACTIVE' },
        });

        const purchaseRecord = await db.pembelian.findUniqueOrThrow({
          where: { id: purchaseId },
        });

        success = purchaseRecord.status === PurchaseStatus.REJECTED && activePackages.length === 0;
        reason = `Purchase status: ${purchaseRecord.status}, Active packages created: ${activePackages.length} (0 sessions leaked)`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5C4',
        'Zero Quota Leakage on Rejected Purchase (Status REJECTED & 0 Packages Created)',
        'Pilar C: Aktivasi Kuota Sesi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR D: PENYESUAIAN SESI MANUAL (SESSION ADJUSTMENTS SOD & MANAGER GATE)
    // ========================================================================
    console.log('\n▶ 5. PILAR D: Penyesuaian Sesi Manual (Session Adjustments SoD & Manager Gate)...');

    // Helper membuat paket pelanggan awal
    async function createCustomerPackageDirect(userId: string, initialSessions = 5) {
      const masterPkg = await createMasterPackage('adj-direct', initialSessions);
      const pkg = await db.paketPelanggan.create({
        data: {
          id: randomUUID(),
          userId,
          packageId: masterPkg.id,
          totalSessions: initialSessions,
          remainingSessions: initialSessions,
          usedSessions: 0,
          validUntil: new Date(Date.now() + 30 * 86_400_000),
          status: 'ACTIVE',
        },
      });
      cleanupCustomerPackageIds.push(pkg.id);
      return pkg;
    }

    // TEST 5.D1: Admin Request Session Adjustment (Pending Queue Creation)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const { user: custUser } = await createTestCustomer('5d1');
        const custPkg = await createCustomerPackageDirect(custUser.id, 5);

        // Admin mengajukan permohonan kompensasi darurat medis
        const res = await sessionAdjustService.createRequest(adminPrincipalA, {
          customerPackageId: custPkg.id,
          reason: 'Customer mengalami cedera lutut saat latihan, kompensasi darurat 2 sesi',
          sessionCount: 2,
        });

        cleanupAdjustRequestIds.push(res.data.id);

        success =
          res.status === 201 &&
          res.data.status === AdjustRequestStatus.PENDING &&
          res.data.sessionCount === 2 &&
          res.data.requestedById === adminUser.id;

        reason = `Request ID: ${res.data.id}, Status: ${res.data.status}, Sesi: ${res.data.sessionCount}, Requester: Admin`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5D1',
        'Admin Request Session Adjustment (Pending Queue Creation with reason & session count)',
        'Pilar D: Penyesuaian Sesi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.D2: Admin Self-Approval of Adjustment Blockade (Manager Gate Enforcement)
    {
      const start = Date.now();
      let blockedAdminApproval = false;
      let reason = '';
      try {
        const { user: custUser } = await createTestCustomer('5d2');
        const custPkg = await createCustomerPackageDirect(custUser.id, 5);

        const res = await sessionAdjustService.createRequest(adminPrincipalA, {
          customerPackageId: custPkg.id,
          reason: 'Kompensasi darurat mati listrik studio',
          sessionCount: 1,
        });
        cleanupAdjustRequestIds.push(res.data.id);

        // Admin mencoba me-approve sendiri permohonan tersebut
        try {
          await sessionAdjustService.decideRequest(adminPrincipalA, res.data.id, {
            decision: 'APPROVED',
            decisionReason: 'Self approved by admin',
          });
        } catch (err: any) {
          if (
            err?.code === 'AUTHORIZATION_REQUIRED' ||
            err?.message?.includes('AUTHORIZATION_REQUIRED')
          ) {
            blockedAdminApproval = true;
            reason = 'AUTHORIZATION_REQUIRED (Admin blocked from deciding session adjustments)';
          }
        }
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5D2',
        'Admin Self-Approval of Adjustment Blockade (Manager Gate Enforcement -> AUTHORIZATION_REQUIRED)',
        'Pilar D: Penyesuaian Sesi',
        blockedAdminApproval,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.D3: Manager Approval & Quota Increment (+2 Sesi & SessionLedger Created)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const { user: custUser } = await createTestCustomer('5d3');
        const custPkg = await createCustomerPackageDirect(custUser.id, 5);

        // 1. Admin request adjustment 2 sesi
        const reqRes = await sessionAdjustService.createRequest(adminPrincipalA, {
          customerPackageId: custPkg.id,
          reason: 'Customer sakit flu dengan surat dokter resmi, kompensasi 2 sesi',
          sessionCount: 2,
        });
        cleanupAdjustRequestIds.push(reqRes.data.id);

        // 2. Manager A approve request
        const decideRes = await sessionAdjustService.decideRequest(
          managerPrincipalA,
          reqRes.data.id,
          {
            decision: 'APPROVED',
            decisionReason: 'Dokumen medis terverifikasi valid oleh Manager',
          },
        );

        // 3. Verifikasi saldo paket pelanggan di DB (5 -> 7)
        const updatedPkg = await db.paketPelanggan.findUniqueOrThrow({
          where: { id: custPkg.id },
        });

        // 4. Verifikasi baris SessionLedger
        const ledgerEntry = await db.sessionLedger.findFirst({
          where: {
            customerPackageId: custPkg.id,
            referenceId: reqRes.data.id,
          },
        });

        success =
          decideRes.data.status === AdjustRequestStatus.APPROVED &&
          updatedPkg.remainingSessions === 7 &&
          ledgerEntry !== null &&
          ledgerEntry.type === SessionMutationType.ADJUST_MANUAL &&
          ledgerEntry.amount === 2 &&
          ledgerEntry.balanceAfter === 7;

        reason = `Status: ${decideRes.data.status}, Sisa Sesi: 5 -> ${updatedPkg.remainingSessions}, Ledger type: ${ledgerEntry?.type}, amount: +${ledgerEntry?.amount}`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5D3',
        'Manager Approval & Quota Increment (+2 Sesi & ADJUST_MANUAL SessionLedger Created)',
        'Pilar D: Penyesuaian Sesi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 5.D4: Re-Decision on Decided Adjustment Blockade
    {
      const start = Date.now();
      let blockedReDecision = false;
      let reason = '';
      try {
        const { user: custUser } = await createTestCustomer('5d4');
        const custPkg = await createCustomerPackageDirect(custUser.id, 5);

        const reqRes = await sessionAdjustService.createRequest(adminPrincipalA, {
          customerPackageId: custPkg.id,
          reason: 'Kompensasi instruktur telat',
          sessionCount: 1,
        });
        cleanupAdjustRequestIds.push(reqRes.data.id);

        // 1. Manager approve pertama kali
        await sessionAdjustService.decideRequest(managerPrincipalA, reqRes.data.id, {
          decision: 'APPROVED',
          decisionReason: 'Disetujui',
        });

        // 2. Coba approve / reject kedua kali
        try {
          await sessionAdjustService.decideRequest(managerPrincipalA, reqRes.data.id, {
            decision: 'REJECTED',
            decisionReason: 'Coba ubah keputusan',
          });
        } catch (err: any) {
          if (
            err?.code === 'INVALID_STATE_TRANSITION' ||
            err?.message?.includes('INVALID_STATE_TRANSITION')
          ) {
            blockedReDecision = true;
            reason = 'INVALID_STATE_TRANSITION (Already decided adjustment cannot be modified)';
          }
        }
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_5D4',
        'Re-Decision on Decided Adjustment Blockade (APPROVED -> INVALID_STATE_TRANSITION)',
        'Pilar D: Penyesuaian Sesi',
        blockedReDecision,
        reason,
        Date.now() - start,
      );
    }

    // ------------------------------------------------------------------------
    // RINGKASAN AKHIR
    // ------------------------------------------------------------------------
    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 RINGKASAN HASIL PENGUJIAN ADVERSARIAL TAHAP 5 (PERSETUJUAN PAKET & PENYESUAIAN)');
    console.log('══════════════════════════════════════════════════════════════════════════════');
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`Total Skenario Diuji : ${results.length}`);
    console.log(`Skenario LULUS (PASS): ${passedCount} ✅`);
    console.log(`Skenario GAGAL (FAIL): ${failedCount} ${failedCount > 0 ? '❌' : '🎉'}\n`);

    if (failedCount > 0) {
      console.error('❌ DAFTAR SKENARIO GAGAL:');
      for (const f of results.filter((r) => !r.passed)) {
        console.error(`- [${f.code}] ${f.name}: ${f.reason}`);
      }
    } else {
      console.log('🎉 SEMUA 16 SKENARIO ADVERSARIAL TAHAP 5 LULUS 100%! 🎉');
      console.log('   Pilar A: Bukti bayar terproteksi dari payload palsu, unverified KYC & IDOR.');
      console.log('   Pilar B: Aturan #2 terbukti! Self-approval dicekal, Admin dicekal & cross-branch dicekal.');
      console.log('   Pilar C: Saldo sesi terbit dengan SessionLedger akurat & idempoten tanpa kebocoran.');
      console.log('   Pilar D: Birokrasi penyesuaian sesi terkunci: Admin request -> Manager gate approval.');
    }
    console.log('══════════════════════════════════════════════════════════════════════════════\n');

    if (failedCount > 0) {
      throw new Error(`Pengujian Adversarial Tahap 5 GAGAL: ${failedCount} skenario terdeteksi bocor!`);
    }
  } finally {
    // ------------------------------------------------------------------------
    // TEARDOWN: Pembersihan Data Uji
    // ------------------------------------------------------------------------
    console.log('🧹 Membersihkan data temporer pengujian Tahap 5...');
    try {
      if (cleanupAdjustRequestIds.length > 0) {
        await db.sessionAdjustRequest.deleteMany({
          where: { id: { in: cleanupAdjustRequestIds } },
        });
      }
      if (cleanupCustomerPackageIds.length > 0) {
        await db.sessionLedger.deleteMany({
          where: { customerPackageId: { in: cleanupCustomerPackageIds } },
        });
        await db.paketPelanggan.deleteMany({
          where: { id: { in: cleanupCustomerPackageIds } },
        });
      }
      if (cleanupPurchaseIds.length > 0) {
        await db.buktiPembayaran.deleteMany({
          where: { purchaseId: { in: cleanupPurchaseIds } },
        });
        await db.sessionLedger.deleteMany({
          where: { referenceId: { in: cleanupPurchaseIds } },
        });
        await db.paketPelanggan.deleteMany({
          where: { purchaseId: { in: cleanupPurchaseIds } },
        });
        await db.pembelian.deleteMany({
          where: { id: { in: cleanupPurchaseIds } },
        });
      }
      if (cleanupMasterPackageIds.length > 0) {
        await db.paket.deleteMany({
          where: { id: { in: cleanupMasterPackageIds } },
        });
      }
      if (cleanupUserIds.length > 0) {
        await db.user.deleteMany({
          where: { id: { in: cleanupUserIds } },
        });
      }
      console.log('   ✅ Seluruh data temporer pengujian Tahap 5 berhasil dibersihkan.\n');
    } catch (cleanErr) {
      console.warn('   ⚠️ Catatan cleanup:', cleanErr);
    } finally {
      await db.$disconnect();
    }
  }
}

main().catch((err) => {
  console.error('\n💥 FATAL ERROR PADA UJI ADVERSARIAL TAHAP 5:', err);
  process.exit(1);
});
