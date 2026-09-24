import { PrismaClient, Role, CloseStatus, CorrectionStatus } from '@prisma/client';
import { randomBytes, randomUUID } from 'node:crypto';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';
import { FinanceService } from '../../apps/api/src/packages/finance.service';
import { ApiProblem } from '../../apps/api/src/identity/security';

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
  console.log('║   DAILYDOSE V2 - UJI ADVERSARIAL TAHAP 6: TUTUP BUKU & PERIOD LOCK           ║');
  console.log('║   "Monthly Close & Owner Branch Isolation (Aturan #8 & #10)" — NO HAPPY PATH ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const financeService = new FinanceService(db as any);

  // Tracking array untuk teardown
  const cleanupUserIds: string[] = [];
  const cleanupOtherCostIds: string[] = [];
  const cleanupCorrectionIds: string[] = [];
  const cleanupMonthlyCloseKeys: { branchId: string; period: string }[] = [];
  const cleanupPurchaseIds: string[] = [];
  const cleanupPackageIds: string[] = [];
  const cleanupSlotIds: string[] = [];
  const cleanupInstructorFeeIds: string[] = [];
  const cleanupProjectionRateIds: string[] = [];

  const TEST_PERIOD_LOCKED = '2024-01';
  const TEST_PERIOD_ACTIVE = '2024-02';
  const TEST_PERIOD_MATH = '2024-03';

  try {
    // ------------------------------------------------------------------------
    // 1. Menyiapkan Aktor Uji & Cabang
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Cabang dan Aktor Uji (Super Owner, Owner A & B, Admin A, Finance A)...');
    const branches = await db.cabang.findMany({ where: { active: true }, take: 2 });
    if (branches.length < 2) {
      throw new Error('Dibutuhkan minimal 2 cabang aktif untuk pengujian isolasi cabang!');
    }
    const branchA = branches[0];
    const branchB = branches[1];

    const defaultClassType = await db.jenisKelas.findFirstOrThrow();

    // Helper membuat User uji
    async function createTestUser(
      tag: string,
      role: Role,
      preferredBranchId?: string,
    ): Promise<{ user: any; principal: SessionPrincipal }> {
      const email = `adv6.${tag}.${randomBytes(3).toString('hex')}@dailydose.test`;
      const user = await db.user.create({
        data: {
          email,
          displayName: `Adv6 ${tag} ${role}`,
          phone: `+62896${Math.floor(10000000 + Math.random() * 90000000)}`,
          role,
          status: 'ACTIVE',
          preferredBranchId: preferredBranchId ?? null,
        },
      });
      cleanupUserIds.push(user.id);

      const isGlobal = role === Role.SUPER_OWNER || role === Role.SUPERADMIN;
      const capabilities: string[] = [];

      if (isGlobal) {
        capabilities.push('branch:all', 'finance:read', 'finance:close', 'finance:manage', 'correction:decide');
      } else if (role === Role.OWNER) {
        capabilities.push('finance:read');
      } else if (role === Role.FINANCE) {
        capabilities.push('finance:read', 'finance:manage', 'finance:close');
      } else if (role === Role.MANAGER) {
        capabilities.push('finance:read', 'other-cost:manage');
      } else if (role === Role.ADMIN) {
        capabilities.push('finance:read', 'other-cost:manage');
      } else if (role === Role.INSTRUCTOR) {
        capabilities.push('instructor:self');
      } else {
        capabilities.push('customer:self');
      }

      const principal: SessionPrincipal = {
        sessionId: `sess-${tag}-${randomUUID().slice(0, 6)}`,
        userId: user.id,
        roles: [{ role, branchId: preferredBranchId ?? null }],
        capabilities,
        branchIds: isGlobal ? [] : (preferredBranchId ? [preferredBranchId] : []),
      };

      return { user, principal };
    }

    const { principal: superOwnerPrincipal } = await createTestUser('superowner', Role.SUPER_OWNER);
    const { principal: ownerPrincipalA } = await createTestUser('ownera', Role.OWNER, branchA.id);
    const { principal: ownerPrincipalB } = await createTestUser('ownerb', Role.OWNER, branchB.id);
    const { principal: financePrincipalA } = await createTestUser('financea', Role.FINANCE, branchA.id);
    const { principal: managerPrincipalA } = await createTestUser('managera', Role.MANAGER, branchA.id);
    const { principal: adminPrincipalA } = await createTestUser('admina', Role.ADMIN, branchA.id);
    const { principal: instructorPrincipalA } = await createTestUser('instra', Role.INSTRUCTOR, branchA.id);
    const { principal: customerPrincipal } = await createTestUser('cust', Role.CUSTOMER);

    console.log(`   Cabang A: ${branchA.name} (${branchA.id})`);
    console.log(`   Cabang B: ${branchB.name} (${branchB.id})`);
    console.log('   Aktor Uji berhasil disiapkan.\n');

    // ========================================================================
    // PILAR A: BIAYA OPERASIONAL (OtherCost) & BOUNDARY TAMPERING PROTECTION
    // ========================================================================
    console.log('▶ 2. PILAR A: Biaya Operasional (OtherCost) & Boundary Tampering Protection...');

    // Skenario 6A1: Nominal negatif / nol / non-finite dicekal
    {
      const start = Date.now();
      let blockedCount = 0;
      const invalidAmounts = [-500_000, 0, NaN, Infinity, -1];

      for (const amt of invalidAmounts) {
        try {
          await financeService.createOtherCost(adminPrincipalA, {
            branchId: branchA.id,
            period: TEST_PERIOD_ACTIVE,
            category: 'UTILITIES',
            description: `Invalid amount test ${amt}`,
            amountRp: amt,
          });
        } catch (err: any) {
          if (err instanceof ApiProblem && err.getStatus() === 400 && err.code === 'INVALID_AMOUNT') {
            blockedCount++;
          }
        }
      }

      const passed = blockedCount === invalidAmounts.length;
      recordResult(
        'TEST_6A1',
        'Invalid / Non-Positive Amount in OtherCost (Negative/0/NaN -> 400 INVALID_AMOUNT)',
        'PILAR A',
        passed,
        passed ? undefined : `Hanya ${blockedCount}/${invalidAmounts.length} yang dicekal`,
        Date.now() - start,
      );
    }

    // Skenario 6A2: Admin Cabang A mencoba menginput biaya untuk Cabang B (Branch Isolation)
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      try {
        await financeService.createOtherCost(adminPrincipalA, {
          branchId: branchB.id, // Cabang B (bukan cabang admin A)
          period: TEST_PERIOD_ACTIVE,
          category: 'MARKETING',
          description: 'Cross branch other cost injection attempt',
          amountRp: 750_000,
        });
        reason = 'Admin Cabang A berhasil menginput biaya untuk Cabang B tanpa dicekal!';
      } catch (err: any) {
        if (err instanceof ApiProblem && err.getStatus() === 403 && err.code === 'FORBIDDEN') {
          passed = true;
        } else {
          reason = `Error tidak sesuai ekspektasi: ${err.message || err}`;
        }
      }

      recordResult(
        'TEST_6A2',
        'Unauthorized Staff OtherCost Injection (Admin A -> Branch B -> 403 FORBIDDEN)',
        'PILAR A',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // Siapkan periode terkunci untuk pengujian Period Lock (Rule #8)
    await db.monthlyClose.upsert({
      where: { branchId_period: { branchId: branchA.id, period: TEST_PERIOD_LOCKED } },
      create: {
        branchId: branchA.id,
        period: TEST_PERIOD_LOCKED,
        status: CloseStatus.LOCKED,
        omsetRp: 25_000_000,
        costRealtimeRp: 5_000_000,
        costProjectionRp: 4_500_000,
        otherCostRp: 2_000_000,
        profitRp: 18_000_000,
        controlHash: `hash-test-${branchA.id}-${TEST_PERIOD_LOCKED}`,
        closedById: superOwnerPrincipal.userId,
        closedAt: new Date(`${TEST_PERIOD_LOCKED}-28T23:59:59Z`),
      },
      update: {
        status: CloseStatus.LOCKED,
        omsetRp: 25_000_000,
        profitRp: 18_000_000,
      },
    });
    cleanupMonthlyCloseKeys.push({ branchId: branchA.id, period: TEST_PERIOD_LOCKED });

    // Skenario 6A3: Penambahan OtherCost pada periode terkunci dicekal (Rule #8)
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      try {
        await financeService.createOtherCost(financePrincipalA, {
          branchId: branchA.id,
          period: TEST_PERIOD_LOCKED, // Periode LOCKED
          category: 'MAINTENANCE',
          description: 'Late expense injection attempt in locked period',
          amountRp: 1_200_000,
        });
        reason = 'Berhasil menambahkan biaya operasional pada periode yang sudah LOCKED!';
      } catch (err: any) {
        if (err instanceof ApiProblem && err.getStatus() === 409 && err.code === 'PERIOD_ALREADY_LOCKED') {
          passed = true;
        } else {
          reason = `Error tidak sesuai ekspektasi: ${err.message || err}`;
        }
      }

      recordResult(
        'TEST_6A3',
        'OtherCost Creation in Locked Period Blockade (Rule #8: LOCKED -> 409 PERIOD_ALREADY_LOCKED)',
        'PILAR A',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // Skenario 6A4: Penghapusan OtherCost pada periode terkunci dicekal (Rule #8)
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      // Buat data OtherCost langsung di DB di bawah periode terkunci
      const preCloseCost = await db.otherCost.create({
        data: {
          branchId: branchA.id,
          period: TEST_PERIOD_LOCKED,
          category: 'SUPPLIES',
          description: 'Historical supplies expense before lock',
          amountRp: 350_000,
          createdById: adminPrincipalA.userId,
        },
      });
      cleanupOtherCostIds.push(preCloseCost.id);

      try {
        await financeService.deleteOtherCost(adminPrincipalA, preCloseCost.id);
        reason = 'Berhasil menghapus biaya operasional di periode yang berstatus LOCKED!';
      } catch (err: any) {
        if (err instanceof ApiProblem && err.getStatus() === 409 && err.code === 'PERIOD_ALREADY_LOCKED') {
          passed = true;
        } else {
          reason = `Error tidak sesuai ekspektasi: ${err.message || err}`;
        }
      }

      // Verifikasi data tetap utuh di DB
      const stillExists = await db.otherCost.findUnique({ where: { id: preCloseCost.id } });
      if (!stillExists) {
        passed = false;
        reason = 'Data terhapus dari database padahal periode terkunci!';
      }

      recordResult(
        'TEST_6A4',
        'OtherCost Deletion in Locked Period Blockade (Rule #8: Tamper Protection -> 409 Conflict)',
        'PILAR A',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR B: GERBANG TUTUP BUKU BULANAN (MONTHLY CLOSE) & PERIOD LOCK
    // ========================================================================
    console.log('\n▶ 3. PILAR B: Gerbang Tutup Buku Bulanan (Monthly Close) & Period Lock Enforcement...');

    // Skenario 6B1: Role tidak sah (Admin, Instruktur, Customer) mencoba mengeksekusi tutup buku
    {
      const start = Date.now();
      let blockedCount = 0;
      const unauthorizedPrincipals = [adminPrincipalA, instructorPrincipalA, customerPrincipal];

      for (const p of unauthorizedPrincipals) {
        try {
          await financeService.executeMonthlyClose(p, {
            branchId: branchA.id,
            period: '2024-05',
          });
        } catch (err: any) {
          if (err instanceof ApiProblem && err.getStatus() === 403 && err.code === 'FORBIDDEN') {
            blockedCount++;
          }
        }
      }

      const passed = blockedCount === unauthorizedPrincipals.length;
      recordResult(
        'TEST_6B1',
        'Unauthorized Role Monthly Close Attempt (Admin/Instructor/Customer -> 403 FORBIDDEN)',
        'PILAR B',
        passed,
        passed ? undefined : `Hanya ${blockedCount}/${unauthorizedPrincipals.length} yang dicekal`,
        Date.now() - start,
      );
    }

    // Skenario 6B2: Manager / Owner / Admin Cabang A mencoba mengeksekusi tutup buku Cabang B (Cross-Branch)
    {
      const start = Date.now();
      let blockedCount = 0;
      const crossBranchPrincipals = [managerPrincipalA, ownerPrincipalA, adminPrincipalA];

      for (const p of crossBranchPrincipals) {
        try {
          await financeService.executeMonthlyClose(p, {
            branchId: branchB.id,
            period: '2024-05',
          });
        } catch (err: any) {
          if (err instanceof ApiProblem && err.getStatus() === 403 && err.code === 'FORBIDDEN') {
            blockedCount++;
          }
        }
      }

      const passed = blockedCount === crossBranchPrincipals.length;
      recordResult(
        'TEST_6B2',
        'Cross-Branch Monthly Close Attempt (Manager A/Owner A/Admin A -> Branch B -> 403 FORBIDDEN)',
        'PILAR B',
        passed,
        passed ? undefined : `Hanya ${blockedCount}/${crossBranchPrincipals.length} yang dicekal`,
        Date.now() - start,
      );
    }

    // Skenario 6B3: Eksekusi Tutup Buku oleh Super Owner & Pembekuan Snapshot
    const EXEC_CLOSE_PERIOD = '2024-06';
    let lockedSnapshotOmset = 0;
    let lockedSnapshotProfit = 0;
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      // Buat 1 data OtherCost di periode ini agar ada angka finansial
      const seededCost = await financeService.createOtherCost(financePrincipalA, {
        branchId: branchA.id,
        period: EXEC_CLOSE_PERIOD,
        category: 'MARKETING',
        description: 'Pre-close marketing budget',
        amountRp: 800_000,
      });
      cleanupOtherCostIds.push(seededCost.id);

      try {
        const closed = await financeService.executeMonthlyClose(superOwnerPrincipal, {
          branchId: branchA.id,
          period: EXEC_CLOSE_PERIOD,
          reason: 'Penutupan buku bulanan resmi periode 2024-06',
        });
        cleanupMonthlyCloseKeys.push({ branchId: branchA.id, period: EXEC_CLOSE_PERIOD });

        if (
          closed.status === 'LOCKED' &&
          closed.branchId === branchA.id &&
          closed.period === EXEC_CLOSE_PERIOD &&
          closed.otherCostRp === 800_000 &&
          closed.closedById === superOwnerPrincipal.userId &&
          closed.controlHash &&
          closed.controlHash.startsWith('hash-')
        ) {
          lockedSnapshotOmset = closed.omsetRp;
          lockedSnapshotProfit = closed.profitRp;

          // Uji idempoten: memanggil tutup buku lagi mengembalikan record yang sama tanpa error
          const replay = await financeService.executeMonthlyClose(superOwnerPrincipal, {
            branchId: branchA.id,
            period: EXEC_CLOSE_PERIOD,
          });
          if (replay.status === 'LOCKED' && replay.id === closed.id) {
            passed = true;
          } else {
            reason = 'Idempotent close replay gagal mengembalikan record terkunci yang sama!';
          }
        } else {
          reason = `Data snapshot tidak lengkap atau status bukan LOCKED: ${JSON.stringify(closed)}`;
        }
      } catch (err: any) {
        reason = `Gagal mengeksekusi tutup buku: ${err.message || err}`;
      }

      recordResult(
        'TEST_6B3',
        'Successful Monthly Close Execution & Snapshot Freezing (Super Owner -> LOCKED & Hash)',
        'PILAR B',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // Skenario 6B4: Integritas Snapshot Historis Kebal Terhadap Injeksi Retroaktif (Rule #8)
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      // Suntikkan transaksi pembelian baru dengan tanggal jatuh di periode 2024-06 yang SUDAH LOCKED
      const testPkg = await db.paket.create({
        data: {
          id: randomUUID(),
          classTypeId: defaultClassType.id,
          code: `PKG-TAMPER-${randomBytes(3).toString('hex').toUpperCase()}`,
          name: 'Paket Injeksi Tamper',
          sessionCount: 5,
          validityDays: 30,
          priceRp: 5_000_000,
          status: 'ACTIVE',
        },
      });
      cleanupPackageIds.push(testPkg.id);

      const injectedPurchase = await db.pembelian.create({
        data: {
          id: randomUUID(),
          invoiceNumber: `INV-TAMPER-${Date.now()}`,
          userId: customerPrincipal.userId,
          packageId: testPkg.id,
          branchId: branchA.id,
          subtotalRp: 5_000_000,
          totalAmountRp: 5_000_000,
          status: 'PAID',
          paymentMethod: 'BANK_TRANSFER',
          paidAt: new Date(`${EXEC_CLOSE_PERIOD}-15T10:00:00Z`), // Masuk di periode terkunci
          createdAt: new Date(`${EXEC_CLOSE_PERIOD}-15T10:00:00Z`),
        },
      });
      cleanupPurchaseIds.push(injectedPurchase.id);

      // Panggil laporan laba rugi bulanan untuk periode terkunci tersebut
      const profitReport = await financeService.monthlyProfitReport(superOwnerPrincipal, {
        branchId: branchA.id,
        period: EXEC_CLOSE_PERIOD,
      });

      // Laporan HARUS tetap menyajikan angka snapshot lama (omset = lockedSnapshotOmset), BUKAN lockedSnapshotOmset + 5_000_000
      if (
        profitReport.isLocked === true &&
        profitReport.status === 'LOCKED' &&
        profitReport.omsetRp === lockedSnapshotOmset &&
        profitReport.netProfitRealtimeRp === lockedSnapshotProfit
      ) {
        passed = true;
      } else {
        reason = `Snapshot bocor! omsetRp terbaca ${profitReport.omsetRp} (seharusnya beku di ${lockedSnapshotOmset})`;
      }

      recordResult(
        'TEST_6B4',
        'Immutable Historical Snapshot Integrity (Retroactive Purchase Injection Defeated -> Rule #8)',
        'PILAR B',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR C: JURNAL KOREKSI PASCA-LOCK & GERBANG SUPER OWNER (RULE #8)
    // ========================================================================
    console.log('\n▶ 4. PILAR C: Jurnal Koreksi Pasca-Lock & Gerbang Super Owner (Rule #8)...');

    let correctionId = '';

    // Skenario 6C1: Pengajuan Jurnal Koreksi untuk periode terkunci dialokasikan ke periode aktif
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      try {
        const correction = await financeService.createCorrection(adminPrincipalA, {
          branchId: branchA.id,
          targetPeriod: EXEC_CLOSE_PERIOD, // Periode lama yang terkunci
          period: TEST_PERIOD_ACTIVE, // Periode berjalan tempat koreksi dibebankan
          amountRp: -250_000, // Koreksi pengurang biaya atau penyesuaian laba
          reason: 'Koreksi selisih pencatatan tagihan listrik periode lampau',
        });
        cleanupCorrectionIds.push(correction.id);
        correctionId = correction.id;

        if (
          correction.status === 'PENDING' &&
          correction.targetPeriod === EXEC_CLOSE_PERIOD &&
          correction.period === TEST_PERIOD_ACTIVE &&
          correction.amountRp === -250_000 &&
          correction.requestedById === adminPrincipalA.userId
        ) {
          passed = true;
        } else {
          reason = `Data jurnal koreksi tidak valid: ${JSON.stringify(correction)}`;
        }
      } catch (err: any) {
        reason = `Gagal membuat jurnal koreksi: ${err.message || err}`;
      }

      recordResult(
        'TEST_6C1',
        'Correction Request Creation for Locked Period (Admin A -> PENDING Status Created)',
        'PILAR C',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // Skenario 6C2: Admin mencoba menyetujui jurnal koreksi sendiri (Privilege Escalation Blockade)
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      try {
        await financeService.decideCorrection(adminPrincipalA, correctionId, 'APPROVE');
        reason = 'Admin berhasil menyetujui jurnal koreksi (Privilege Escalation)!';
      } catch (err: any) {
        if (err instanceof ApiProblem && err.getStatus() === 403 && err.code === 'FORBIDDEN') {
          passed = true;
        } else {
          reason = `Error tidak sesuai ekspektasi: ${err.message || err}`;
        }
      }

      recordResult(
        'TEST_6C2',
        'Admin Self-Approval of Correction Blockade (Rule #8: Admin -> 403 FORBIDDEN)',
        'PILAR C',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // Skenario 6C3: Owner cabang biasa mencoba menyetujui jurnal koreksi (Rule #8: Super Owner Gate)
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      try {
        await financeService.decideCorrection(ownerPrincipalA, correctionId, 'APPROVE');
        reason = 'Owner cabang biasa berhasil menyetujui jurnal koreksi padahal wajib Super Owner!';
      } catch (err: any) {
        if (err instanceof ApiProblem && err.getStatus() === 403 && err.code === 'FORBIDDEN') {
          passed = true;
        } else {
          reason = `Error tidak sesuai ekspektasi: ${err.message || err}`;
        }
      }

      recordResult(
        'TEST_6C3',
        'Branch Owner Approval Blockade (Rule #8: Owner Cabang -> 403 FORBIDDEN Super Owner Gate)',
        'PILAR C',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // Skenario 6C4: Super Owner menyetujui koreksi & penyesuaian berdampak pada laba periode berjalan
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      try {
        const decided = await financeService.decideCorrection(
          superOwnerPrincipal,
          correctionId,
          'APPROVE',
          'Disetujui oleh Super Owner setelah verifikasi bukti rekonsiliasi bank',
        );

        if (
          decided.status === 'APPROVED' &&
          decided.approvedById === superOwnerPrincipal.userId &&
          decided.approvedAt
        ) {
          // Cek laporan laba rugi pada periode berjalan TEST_PERIOD_ACTIVE
          const activeProfitReport = await financeService.monthlyProfitReport(superOwnerPrincipal, {
            branchId: branchA.id,
            period: TEST_PERIOD_ACTIVE,
          });

          // totalCorrectionAdjustmentRp harus mencerminkan -250_000
          // adjustedNetProfitRealtimeRp harus = netProfitRealtimeRp + (-250_000)
          if (
            activeProfitReport.totalCorrectionAdjustmentRp === -250_000 &&
            activeProfitReport.adjustedNetProfitRealtimeRp ===
              activeProfitReport.netProfitRealtimeRp - 250_000
          ) {
            // Verifikasi juga snapshot periode lama EXEC_CLOSE_PERIOD tetap beku tanpa perubahan
            const oldReport = await financeService.monthlyProfitReport(superOwnerPrincipal, {
              branchId: branchA.id,
              period: EXEC_CLOSE_PERIOD,
            });
            if (oldReport.omsetRp === lockedSnapshotOmset && oldReport.netProfitRealtimeRp === lockedSnapshotProfit) {
              passed = true;
            } else {
              reason = 'Snapshot historis periode terkunci terdistorsi oleh jurnal koreksi!';
            }
          } else {
            reason = `Kalkulasi laba terdistorsi: correction=${activeProfitReport.totalCorrectionAdjustmentRp}, adjustedProfit=${activeProfitReport.adjustedNetProfitRealtimeRp}`;
          }
        } else {
          reason = `Status persetujuan tidak valid: ${JSON.stringify(decided)}`;
        }
      } catch (err: any) {
        reason = `Gagal memproses persetujuan Super Owner: ${err.message || err}`;
      }

      recordResult(
        'TEST_6C4',
        'Super Owner Decision & Adjusted Profit Impact (Rule #8: Adjusted Profit Updated Accurately)',
        'PILAR C',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR D: 5 LAPORAN FINANSIAL INTI & ISOLASI CABANG OWNER (RULE #10)
    // ========================================================================
    console.log('\n▶ 5. PILAR D: 5 Laporan Finansial Inti & Isolasi Cabang Owner (Rule #10)...');

    // Skenario 6D1: Owner Cabang A dilarang mengakses performa atau laporan Cabang B (Rule #10)
    {
      const start = Date.now();
      let blockedCount = 0;

      // 1. ownerBranchPerformance
      try {
        await financeService.ownerBranchPerformance(ownerPrincipalA, {
          branchId: branchB.id,
          period: TEST_PERIOD_ACTIVE,
        });
      } catch (err: any) {
        if (err instanceof ApiProblem && err.getStatus() === 403 && err.code === 'FORBIDDEN') {
          blockedCount++;
        }
      }

      // 2. omsetReport
      try {
        await financeService.omsetReport(ownerPrincipalA, {
          branchId: branchB.id,
          period: TEST_PERIOD_ACTIVE,
        });
      } catch (err: any) {
        if (err instanceof ApiProblem && err.getStatus() === 403 && err.code === 'FORBIDDEN') {
          blockedCount++;
        }
      }

      // 3. monthlyProfitReport
      try {
        await financeService.monthlyProfitReport(ownerPrincipalA, {
          branchId: branchB.id,
          period: TEST_PERIOD_ACTIVE,
        });
      } catch (err: any) {
        if (err instanceof ApiProblem && err.getStatus() === 403 && err.code === 'FORBIDDEN') {
          blockedCount++;
        }
      }

      const passed = blockedCount === 3;
      recordResult(
        'TEST_6D1',
        'Owner Cross-Branch Performance Access Blockade (Rule #10: Owner A -> Branch B -> 403 FORBIDDEN)',
        'PILAR D',
        passed,
        passed ? undefined : `Hanya ${blockedCount}/3 endpoint yang dicekal`,
        Date.now() - start,
      );
    }

    // Skenario 6D2: Super Owner memiliki visibilitas global konsolidasi ke seluruh cabang
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      try {
        // Akses cabang A
        const perfA = await financeService.ownerBranchPerformance(superOwnerPrincipal, {
          branchId: branchA.id,
          period: TEST_PERIOD_ACTIVE,
        });
        // Akses cabang B
        const perfB = await financeService.ownerBranchPerformance(superOwnerPrincipal, {
          branchId: branchB.id,
          period: TEST_PERIOD_ACTIVE,
        });
        // Akses konsolidasi omset (tanpa branchId)
        const omsetConsolidated = await financeService.omsetReport(superOwnerPrincipal, {
          period: TEST_PERIOD_ACTIVE,
        });

        if (perfA.branch.id === branchA.id && perfB.branch.id === branchB.id && omsetConsolidated.branchId === 'ALL') {
          passed = true;
        } else {
          reason = 'Data konsolidasi Super Owner tidak sesuai ekspektasi struktur.';
        }
      } catch (err: any) {
        reason = `Super Owner gagal mengakses data konsolidasi: ${err.message || err}`;
      }

      recordResult(
        'TEST_6D2',
        'Super Owner Global Visibility (Rule #10: Consolidated Access Across All Branches -> 200 OK)',
        'PILAR D',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // Skenario 6D3: Konsistensi Matematis di Antara 5 Laporan Finansial Inti
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      // Siapkan data deterministik pada TEST_PERIOD_MATH
      // 1. Pembelian Paket (Omset): 2 x Rp 2.500.000 = Rp 5.000.000
      const mathPkg = await db.paket.create({
        data: {
          id: randomUUID(),
          classTypeId: defaultClassType.id,
          code: `PKG-MATH-${randomBytes(3).toString('hex').toUpperCase()}`,
          name: 'Paket Verifikasi Math',
          sessionCount: 10,
          validityDays: 30,
          priceRp: 2_500_000,
          status: 'ACTIVE',
        },
      });
      cleanupPackageIds.push(mathPkg.id);

      const p1 = await db.pembelian.create({
        data: {
          id: randomUUID(),
          invoiceNumber: `INV-M1-${Date.now()}`,
          userId: customerPrincipal.userId,
          packageId: mathPkg.id,
          branchId: branchA.id,
          subtotalRp: 2_500_000,
          totalAmountRp: 2_500_000,
          status: 'PAID',
          paymentMethod: 'BANK_TRANSFER',
          paidAt: new Date(`${TEST_PERIOD_MATH}-10T10:00:00Z`),
          createdAt: new Date(`${TEST_PERIOD_MATH}-10T10:00:00Z`),
        },
      });
      const p2 = await db.pembelian.create({
        data: {
          id: randomUUID(),
          invoiceNumber: `INV-M2-${Date.now()}`,
          userId: customerPrincipal.userId,
          packageId: mathPkg.id,
          branchId: branchA.id,
          subtotalRp: 2_500_000,
          totalAmountRp: 2_500_000,
          status: 'PAID',
          paymentMethod: 'BANK_TRANSFER',
          paidAt: new Date(`${TEST_PERIOD_MATH}-11T10:00:00Z`),
          createdAt: new Date(`${TEST_PERIOD_MATH}-11T10:00:00Z`),
        },
      });
      cleanupPurchaseIds.push(p1.id, p2.id);

      // 2. Instructor Fee & Slot Kelas (Cost Realtime):
      // Tarif: Rp 200.000 / jam
      const feeRule = await db.instructorFee.create({
        data: {
          id: randomUUID(),
          instructorId: instructorPrincipalA.userId,
          branchId: branchA.id,
          classTypeId: defaultClassType.id,
          feePerJamRp: 200_000,
          effectiveDate: new Date('2023-01-01T00:00:00Z'),
        },
      });
      cleanupInstructorFeeIds.push(feeRule.id);

      // Slot 1 jam status COMPLETED
      const studio = await db.studio.findFirstOrThrow({ where: { branchId: branchA.id } });
      const room = await db.ruangan.findFirst({ where: { studioId: studio.id } });
      const completedSlot = await db.slotKelas.create({
        data: {
          id: randomUUID(),
          branchId: branchA.id,
          studioId: studio.id,
          roomId: room?.id ?? null,
          classTypeId: defaultClassType.id,
          instructorId: instructorPrincipalA.userId,
          startAt: new Date(`${TEST_PERIOD_MATH}-12T09:00:00Z`),
          endAt: new Date(`${TEST_PERIOD_MATH}-12T10:00:00Z`), // 1 Jam
          capacity: 8,
          status: 'COMPLETED',
        },
      });
      cleanupSlotIds.push(completedSlot.id);

      // 3. Other Cost: Rp 600.000
      const mathOtherCost = await db.otherCost.create({
        data: {
          branchId: branchA.id,
          period: TEST_PERIOD_MATH,
          category: 'OPERATIONAL',
          description: 'Deterministic math validation cost',
          amountRp: 600_000,
          createdById: adminPrincipalA.userId,
        },
      });
      cleanupOtherCostIds.push(mathOtherCost.id);

      // Tarik kelima laporan
      const [omsetRep, realtimeRep, projectionRep, otherCostRep, profitRep] = await Promise.all([
        financeService.omsetReport(superOwnerPrincipal, { branchId: branchA.id, period: TEST_PERIOD_MATH }),
        financeService.realtimeInstructorCostReport(superOwnerPrincipal, { branchId: branchA.id, period: TEST_PERIOD_MATH }),
        financeService.projectionInstructorCostReport(superOwnerPrincipal, { branchId: branchA.id, period: TEST_PERIOD_MATH }),
        financeService.otherCostReport(superOwnerPrincipal, { branchId: branchA.id, period: TEST_PERIOD_MATH }),
        financeService.monthlyProfitReport(superOwnerPrincipal, { branchId: branchA.id, period: TEST_PERIOD_MATH }),
      ]);

      const expectedNetRealtime = omsetRep.totalOmsetRp - realtimeRep.totalInstructorCostRp - otherCostRep.totalOtherCostRp;
      const expectedNetProjection = omsetRep.totalOmsetRp - projectionRep.totalProjectionCostRp - otherCostRep.totalOtherCostRp;
      const expectedAdjustedProfit = expectedNetRealtime + profitRep.totalCorrectionAdjustmentRp;

      const isMathExact =
        profitRep.omsetRp === omsetRep.totalOmsetRp &&
        profitRep.costRealtimeRp === realtimeRep.totalInstructorCostRp &&
        profitRep.costProjectionRp === projectionRep.totalProjectionCostRp &&
        profitRep.otherCostRp === otherCostRep.totalOtherCostRp &&
        profitRep.netProfitRealtimeRp === expectedNetRealtime &&
        profitRep.netProfitProjectionRp === expectedNetProjection &&
        profitRep.adjustedNetProfitRealtimeRp === expectedAdjustedProfit &&
        omsetRep.totalOmsetRp >= 5_000_000 &&
        otherCostRep.totalOtherCostRp >= 600_000;

      if (isMathExact) {
        passed = true;
      } else {
        reason = `Ketidakkonsistenan matematis laporan: omset(${omsetRep.totalOmsetRp} vs ${profitRep.omsetRp}), realtime(${realtimeRep.totalInstructorCostRp} vs ${profitRep.costRealtimeRp}), otherCost(${otherCostRep.totalOtherCostRp} vs ${profitRep.otherCostRp}), profitRealtime(${profitRep.netProfitRealtimeRp} vs exp ${expectedNetRealtime})`;
      }

      recordResult(
        'TEST_6D3',
        '5 Core Financial Reports Mathematical Consistency (Omset - RealtimeCost - OtherCost = NetProfit)',
        'PILAR D',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // Skenario 6D4: Daftar Periode Finansial & Sintesis Periode Berjalan yang Masih 'OPEN'
    {
      const start = Date.now();
      let passed = false;
      let reason = '';

      try {
        const periodList = await financeService.periods(superOwnerPrincipal, { branchId: branchA.id });
        const currentYearMonth = new Date().toISOString().slice(0, 7);

        // Harus mengandung periode yang sudah LOCKED (seperti EXEC_CLOSE_PERIOD) dan periode berjalan (OPEN)
        const hasLockedPeriod = periodList.items.some((p) => p.period === EXEC_CLOSE_PERIOD && p.status === 'LOCKED');
        const hasCurrentOpenPeriod = periodList.items.some((p) => p.period === currentYearMonth && p.status === 'OPEN');

        if (hasLockedPeriod && hasCurrentOpenPeriod) {
          passed = true;
        } else {
          reason = `Periode tidak lengkap: hasLocked=${hasLockedPeriod}, hasCurrentOpen=${hasCurrentOpenPeriod}`;
        }
      } catch (err: any) {
        reason = `Gagal memanggil endpoint periods: ${err.message || err}`;
      }

      recordResult(
        'TEST_6D4',
        'Financial Periods List & Current Open Period Synthesis (LOCKED History + OPEN Current Period)',
        'PILAR D',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // RINGKASAN & STATISTIK PENGUJIAN TAHAP 6
    // ========================================================================
    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 RINGKASAN HASIL PENGUJIAN ADVERSARIAL TAHAP 6 (TUTUP BUKU & PERIOD LOCK)');
    console.log('══════════════════════════════════════════════════════════════════════════════');
    const totalPassed = results.filter((r) => r.passed).length;
    const totalFailed = results.filter((r) => !r.passed).length;
    console.log(`Total Skenario Diuji : ${results.length}`);
    console.log(`Skenario LULUS (PASS): ${totalPassed} ✅`);
    console.log(`Skenario GAGAL (FAIL): ${totalFailed} ${totalFailed > 0 ? '❌' : '🎉'}\n`);

    if (totalFailed === 0) {
      console.log('🎉 SEMUA 16 SKENARIO ADVERSARIAL TAHAP 6 LULUS 100%! 🎉');
      console.log('   Pilar A: Biaya operasional aman dari nominal negatif, injeksi silang & periode lock.');
      console.log('   Pilar B: Aturan #8 terbukti! Tutup buku membekukan snapshot kebal tamper retroaktif.');
      console.log('   Pilar C: Jurnal Koreksi terkunci ketat di Super Owner gate tanpa merusak data lampau.');
      console.log('   Pilar D: Aturan #10 terbukti! Owner terisolasi pada cabangnya, 5 laporan konsisten.');
    } else {
      console.error('⚠️ DITEMUKAN SKENARIO YANG GAGAL. Harap periksa detail di atas!');
      process.exitCode = 1;
    }
    console.log('══════════════════════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Terjadi kesalahan fatal saat menjalankan pengujian Tahap 6:', error);
    process.exitCode = 1;
  } finally {
    console.log('🧹 Membersihkan data temporer pengujian Tahap 6...');
    try {
      if (cleanupCorrectionIds.length > 0) {
        await db.correctionJournal.deleteMany({ where: { id: { in: cleanupCorrectionIds } } });
      }
      if (cleanupOtherCostIds.length > 0) {
        await db.otherCost.deleteMany({ where: { id: { in: cleanupOtherCostIds } } });
      }
      if (cleanupSlotIds.length > 0) {
        await db.slotKelas.deleteMany({ where: { id: { in: cleanupSlotIds } } });
      }
      if (cleanupInstructorFeeIds.length > 0) {
        await db.instructorFee.deleteMany({ where: { id: { in: cleanupInstructorFeeIds } } });
      }
      if (cleanupProjectionRateIds.length > 0) {
        await db.projectionRate.deleteMany({ where: { id: { in: cleanupProjectionRateIds } } });
      }
      if (cleanupPurchaseIds.length > 0) {
        await db.pembelian.deleteMany({ where: { id: { in: cleanupPurchaseIds } } });
      }
      if (cleanupPackageIds.length > 0) {
        await db.paket.deleteMany({ where: { id: { in: cleanupPackageIds } } });
      }
      for (const key of cleanupMonthlyCloseKeys) {
        await db.monthlyClose.deleteMany({ where: { branchId: key.branchId, period: key.period } });
      }
      if (cleanupUserIds.length > 0) {
        await db.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
      }
      console.log('   ✅ Seluruh data temporer pengujian Tahap 6 berhasil dibersihkan.\n');
    } catch (cleanupErr) {
      console.error('   ⚠️ Gagal membersihkan sebagian data temporer:', cleanupErr);
    } finally {
      await db.$disconnect();
    }
  }
}

main();
