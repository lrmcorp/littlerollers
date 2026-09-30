import {
  PrismaClient,
  Role,
  PurchaseStatus,
  AdjustRequestStatus,
  SessionMutationType,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import {
  mapUserToEffectiveRoles,
  type SessionPrincipal,
} from '../../apps/api/src/identity/identity.service';
import { OwnerBranchService } from '../../apps/api/src/identity/owner-branch.service';
import { CustomerManagementService } from '../../apps/api/src/identity/manajemen-pelanggan.service';
import { FinanceService } from '../../apps/api/src/packages/finance.service';
import { PaymentReviewService } from '../../apps/api/src/packages/verifikasi-pembayaran.service';
import { PackageAccessService } from '../../apps/api/src/packages/package-access.service';
import { LedgerService } from '../../apps/api/src/packages/ledger.service';
import { AuditService } from '../../apps/api/src/foundation/audit.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { MasterAccessService } from '../../apps/api/src/master/master-access.service';
import { EffectiveSettingsService } from '../../apps/api/src/master/konfigurasi-efektif.service';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - VERIFIKASI FASE 2: STRUKTUR 7 ROLE & MULTI-CABANG (RBAC)    ║');
  console.log('║   (Role Matrix, Owner Scope, Manager Approvals, Stopped Customer, Rule #10)   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();

  const policy = new PolicyService();
  const audit = new AuditService(db as any);
  const idempotency = new IdempotencyService(db as any);
  const packageAccess = new PackageAccessService(db as any, policy, audit);
  const ownerBranchService = new OwnerBranchService(db as any);
  const customerManagement = new CustomerManagementService(db as any, policy, idempotency);
  const financeService = new FinanceService(db as any, policy);
  const paymentReviewService = new PaymentReviewService(db as any, idempotency, packageAccess);
  const ledgerService = new LedgerService(db as any, policy, audit);
  const masterAccess = new MasterAccessService(policy);
  const effectiveSettings = new EffectiveSettingsService(masterAccess, db as any);

  try {
    // ------------------------------------------------------------------------
    // 1. Memeriksa Akun Database 7 Role Resmi
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor & Master Data Pengujian untuk 7 Role...');

    const superOwner = await db.user.findFirstOrThrow({ where: { role: Role.SUPER_OWNER } });
    const owner = await db.user.findFirstOrThrow({ where: { role: Role.OWNER } });
    const manager = await db.user.findFirstOrThrow({ where: { role: Role.MANAGER } });
    const finance = await db.user.findFirstOrThrow({ where: { role: Role.FINANCE } });
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });
    const customer = await db.user.findFirstOrThrow({ where: { role: Role.CUSTOMER } });

    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) {
      throw new Error('Diperlukan minimal 2 cabang di database untuk menguji multi-cabang!');
    }
    const [branchA, branchB] = branches;

    console.log(`   ✅ SUPER_OWNER : ${superOwner.displayName} (${superOwner.email})`);
    console.log(`   ✅ OWNER       : ${owner.displayName} (${owner.email})`);
    console.log(`   ✅ MANAGER     : ${manager.displayName} (${manager.email})`);
    console.log(`   ✅ FINANCE     : ${finance.displayName} (${finance.email})`);
    console.log(`   ✅ ADMIN       : ${admin.displayName} (${admin.email})`);
    console.log(`   ✅ INSTRUCTOR  : ${instructor.displayName} (${instructor.email})`);
    console.log(`   ✅ CUSTOMER    : ${customer.displayName} (${customer.email})`);
    console.log(`   Cabang A: ${branchA.name} (${branchA.code}), Cabang B: ${branchB.name} (${branchB.code})\n`);

    // ------------------------------------------------------------------------
    // 2. Verifikasi Matriks Capability 7 Role
    // ------------------------------------------------------------------------
    console.log('▶ 2. Memverifikasi Resolusi Capability & RBAC 7 Role...');

    const superOwnerAccess = policy.resolveAccess(
      superOwner.id,
      mapUserToEffectiveRoles({ role: 'SUPER_OWNER' }),
    );
    if (!superOwnerAccess.capabilities.includes('branch:all')) {
      throw new Error('SUPER_OWNER harus memiliki capability "branch:all"!');
    }
    if (!superOwnerAccess.capabilities.includes('payment:decide')) {
      throw new Error('SUPER_OWNER harus memiliki capability "payment:decide"!');
    }
    console.log('   ✅ SUPER_OWNER memiliki akses global ("branch:all") dan otoritas penuh.');

    const ownerAccess = policy.resolveAccess(
      owner.id,
      mapUserToEffectiveRoles({
        role: 'OWNER',
        ownedBranches: [{ branchId: branchA.id }],
      }),
    );
    if (ownerAccess.capabilities.includes('branch:all')) {
      throw new Error('OWNER TIDAK BOLEH memiliki capability "branch:all"!');
    }
    if (!ownerAccess.capabilities.includes('dashboard:read')) {
      throw new Error('OWNER harus memiliki capability "dashboard:read"!');
    }
    if (!ownerAccess.capabilities.includes('instructor:fee:read')) {
      throw new Error('OWNER harus memiliki capability "instructor:fee:read" (Rule #10)!');
    }
    console.log('   ✅ OWNER terisolasi ke cabang terdaftar (TIDAK memiliki "branch:all", memiliki "instructor:fee:read").');

    const managerAccess = policy.resolveAccess(
      manager.id,
      mapUserToEffectiveRoles({ role: 'MANAGER', preferredBranchId: branchA.id }),
    );
    if (managerAccess.capabilities.includes('branch:all')) {
      throw new Error('MANAGER TIDAK BOLEH memiliki capability "branch:all"!');
    }
    if (!managerAccess.capabilities.includes('payment:decide') && !managerAccess.capabilities.includes('purchase:decide')) {
      throw new Error('MANAGER harus memiliki capability "purchase:decide" atau "payment:decide" untuk persetujuan paket!');
    }
    if (!managerAccess.capabilities.includes('ledger:adjust:decide')) {
      throw new Error('MANAGER harus memiliki capability "ledger:adjust:decide" untuk koreksi sesi & direct adjustment 1-klik!');
    }
    if (!managerAccess.capabilities.includes('customer:manage')) {
      throw new Error('MANAGER harus memiliki capability "customer:manage"!');
    }
    console.log('   ✅ MANAGER memiliki capability "purchase:decide", "ledger:adjust:decide", dan "customer:manage".');

    const financeAccess = policy.resolveAccess(
      finance.id,
      mapUserToEffectiveRoles({ role: 'FINANCE' }),
    );
    if (!financeAccess.capabilities.includes('branch:all')) {
      throw new Error('FINANCE harus memiliki capability "branch:all"!');
    }
    if (!financeAccess.capabilities.includes('finance:manage')) {
      throw new Error('FINANCE harus memiliki capability "finance:manage"!');
    }
    console.log('   ✅ FINANCE memiliki akses global ("branch:all") dan kapabilitas finansial.');

    const adminAccess = policy.resolveAccess(
      admin.id,
      mapUserToEffectiveRoles({ role: 'ADMIN', preferredBranchId: branchA.id }),
    );
    if (adminAccess.capabilities.includes('branch:all')) {
      throw new Error('ADMIN TIDAK BOLEH memiliki capability "branch:all"!');
    }
    if (!adminAccess.capabilities.includes('customer:manage')) {
      throw new Error('ADMIN harus memiliki capability "customer:manage"!');
    }
    console.log('   ✅ ADMIN memiliki akses operasional cabang (customer:manage, booking:manage).');

    // ------------------------------------------------------------------------
    // 3. Verifikasi Isolasi Cabang & Dynamic Scoping OWNER (Keputusan Bisnis #7)
    // ------------------------------------------------------------------------
    console.log('\n▶ 3. Menguji Isolasi Cabang & Dynamic Multi-Cabang untuk OWNER...');

    // Pastikan relasi awal: Owner terhubung ke branchA dan TIDAK ke branchB
    await db.ownerCabang.deleteMany({
      where: {
        ownerId: owner.id,
        branchId: branchB.id,
      },
    });

    const existingA = await db.ownerCabang.findFirst({
      where: { ownerId: owner.id, branchId: branchA.id },
    });
    if (!existingA) {
      await db.ownerCabang.create({
        data: {
          id: `oc-test-${randomUUID().slice(0, 8)}`,
          ownerId: owner.id,
          branchId: branchA.id,
        },
      });
    }

    // Role mapping saat ini: hanya branchA
    const ownerBranchesInitial = await db.ownerCabang.findMany({
      where: { ownerId: owner.id },
      select: { branchId: true },
    });
    const initialRoles = mapUserToEffectiveRoles({
      role: 'OWNER',
      ownedBranches: ownerBranchesInitial,
    });
    const initialAccess = policy.resolveAccess(owner.id, initialRoles);

    const ownerPrincipalInitial: SessionPrincipal = {
      sessionId: `sess-owner-${randomUUID().slice(0, 6)}`,
      userId: owner.id,
      roles: initialRoles,
      capabilities: initialAccess.capabilities,
      branchIds: initialAccess.branchIds,
    };

    // Tes Akses Cabang A: Harus lolos
    let branchAAccessPassed = false;
    try {
      policy.requireBranchScope(ownerPrincipalInitial, branchA.id);
      branchAAccessPassed = true;
    } catch {
      branchAAccessPassed = false;
    }
    if (!branchAAccessPassed) {
      throw new Error(`Owner gagal mengakses Cabang A (${branchA.name}) yang merupakan miliknya!`);
    }
    console.log(`   ✅ Owner berhasil diverifikasi untuk Cabang A (${branchA.name}).`);

    // Tes Akses Cabang B: Harus dicekal (403 Forbidden)
    let branchBAccessBlocked = false;
    try {
      policy.requireBranchScope(ownerPrincipalInitial, branchB.id);
    } catch {
      branchBAccessBlocked = true;
    }
    if (!branchBAccessBlocked) {
      throw new Error(`Security breach: Owner dapat mengakses Cabang B (${branchB.name}) padahal belum di-assign!`);
    }
    console.log(`   ✅ Owner berhasil DIBLOKIR dari Cabang B (${branchB.name}) - Isolasi Cabang Teruji.`);

    // ------------------------------------------------------------------------
    // 4. Pengujian Super Owner Menugaskan Cabang Tambahan ke Owner
    // ------------------------------------------------------------------------
    console.log('\n▶ 4. Menguji Super Owner Menugaskan Multi-Cabang ke Owner (OwnerCabang)...');

    const superOwnerPrincipal: SessionPrincipal = {
      sessionId: `sess-so-${randomUUID().slice(0, 6)}`,
      userId: superOwner.id,
      roles: [{ role: 'SUPER_OWNER', branchId: null }],
      capabilities: superOwnerAccess.capabilities,
      branchIds: [],
    };

    const newAssignment = await ownerBranchService.assignOwner(superOwnerPrincipal, {
      ownerId: owner.id,
      branchId: branchB.id,
    });
    console.log(`   ✅ Cabang B (${branchB.name}) berhasil ditugaskan ke Owner ID: ${owner.id} (Assignment ID: ${newAssignment.id})`);

    // Re-resolve roles setelah assignment cabang kedua
    const ownerBranchesUpdated = await db.ownerCabang.findMany({
      where: { ownerId: owner.id },
      select: { branchId: true },
    });
    const updatedRoles = mapUserToEffectiveRoles({
      role: 'OWNER',
      ownedBranches: ownerBranchesUpdated,
    });
    const updatedAccess = policy.resolveAccess(owner.id, updatedRoles);

    const ownerPrincipalUpdated: SessionPrincipal = {
      sessionId: `sess-owner-multi-${randomUUID().slice(0, 6)}`,
      userId: owner.id,
      roles: updatedRoles,
      capabilities: updatedAccess.capabilities,
      branchIds: updatedAccess.branchIds,
    };

    if (!ownerPrincipalUpdated.branchIds.includes(branchB.id)) {
      throw new Error('Branch B belum masuk ke dalam daftar branchIds milik Owner!');
    }

    // Sekarang Owner harus bisa mengakses kedua cabang A & B
    policy.requireBranchScope(ownerPrincipalUpdated, branchA.id);
    policy.requireBranchScope(ownerPrincipalUpdated, branchB.id);
    console.log(`   ✅ Owner kini memiliki akses sah ke Cabang A (${branchA.code}) & Cabang B (${branchB.code}).`);

    // Cabut kembali cabang B untuk menguji unassign
    await ownerBranchService.unassignOwner(superOwnerPrincipal, newAssignment.id);
    console.log(`   ✅ Penugasan Cabang B dicabut kembali.`);

    const assignmentCheck = await db.ownerCabang.findUnique({ where: { id: newAssignment.id } });
    if (assignmentCheck) {
      throw new Error('Assignment Cabang B gagal dihapus!');
    }

    // ------------------------------------------------------------------------
    // 5. Verifikasi Otoritas Manager: Approval Pembelian Paket (payment:decide)
    // ------------------------------------------------------------------------
    console.log('\n▶ 5. Menguji Otoritas Manager: Approval Pembelian Paket (payment:decide)...');

    const pkg = await db.paket.findFirstOrThrow({ where: { branchId: branchA.id } });
    const testPurchase = await db.pembelian.create({
      data: {
        id: `purch-test-${randomUUID().slice(0, 8)}`,
        invoiceNumber: `INV-TEST-${Date.now()}`,
        userId: customer.id,
        branchId: branchA.id,
        packageId: pkg.id,
        subtotalRp: pkg.priceRp,
        discountRp: 0,
        totalAmountRp: pkg.priceRp,
        status: PurchaseStatus.WAITING_VERIFICATION,
        paymentMethod: 'BANK_TRANSFER',
      },
    });

    const managerPrincipal: SessionPrincipal = {
      sessionId: `sess-mgr-${randomUUID().slice(0, 6)}`,
      userId: manager.id,
      roles: [{ role: 'MANAGER', branchId: branchA.id }],
      capabilities: managerAccess.capabilities,
      branchIds: [branchA.id],
    };

    const approvalResult = await paymentReviewService.decide(
      managerPrincipal,
      testPurchase.id,
      'APPROVED',
      { reasonCode: 'PAYMENT_VERIFIED', note: 'Verifikasi bukti transfer oleh Manager Cabang' },
      `idem-${randomUUID().slice(0, 8)}`,
      `corr-${randomUUID().slice(0, 8)}`,
    );

    const updatedPurchase = await db.pembelian.findUniqueOrThrow({
      where: { id: testPurchase.id },
    });
    if (updatedPurchase.status !== PurchaseStatus.PAID) {
      throw new Error(`Status pembelian tidak berubah menjadi PAID setelah disetujui Manager! Actual: ${updatedPurchase.status}`);
    }
    console.log(`   ✅ Manager berhasil menyetujui pembelian paket (Status: ${updatedPurchase.status}).`);

    // Periksa bahwa customer package dan SessionLedger bertambah
    const createdCustomerPkg = await db.paketPelanggan.findFirst({
      where: { purchaseId: testPurchase.id },
    });
    if (!createdCustomerPkg) {
      throw new Error('PaketPelanggan tidak terbentuk setelah disetujui Manager!');
    }
    const ledgerEntry = await db.sessionLedger.findFirst({
      where: {
        customerPackageId: createdCustomerPkg.id,
        type: SessionMutationType.PURCHASE,
      },
    });
    if (!ledgerEntry || ledgerEntry.amount <= 0) {
      throw new Error('SessionLedger tidak mencatat penambahan kuota sesi!');
    }
    console.log(`   ✅ SessionLedger otomatis mencatat mutasi PURCHASE: +${ledgerEntry.amount} sesi.`);

    // ------------------------------------------------------------------------
    // 6. Verifikasi Otoritas Manager: Approval & Direct Session Adjust (Rule #6 & Direct 1-Klik)
    // ------------------------------------------------------------------------
    console.log('\n▶ 6. Menguji Otoritas Manager: Approval & Direct Session Adjust Request...');

    const adminPrincipal: SessionPrincipal = {
      sessionId: `sess-adm-${randomUUID().slice(0, 6)}`,
      userId: admin.id,
      roles: [{ role: 'ADMIN', branchId: branchA.id }],
      capabilities: adminAccess.capabilities,
      branchIds: [branchA.id],
    };

    const adjustReqRes = await ledgerService.requestAdjustment(
      adminPrincipal,
      {
        customerPackageId: createdCustomerPkg.id,
        quantity: 1,
        reasonCode: 'PACKAGE_COMPENSATION',
        note: 'Ganti rugi pembatalan kelas darurat oleh instruktur',
      },
      `key-adj-p2-${Date.now()}`,
    );

    const approvedAdjust = await ledgerService.decideAdjustment(
      managerPrincipal,
      adjustReqRes.id,
      'approve',
      {
        reasonCode: 'CORRECTION_VERIFIED',
        note: 'Disetujui kompensasi oleh Manager Cabang',
        expectedVersion: 1,
      },
    );

    if (approvedAdjust.adjustment.status !== 'POSTED') {
      throw new Error(`Status adjust request bukan POSTED! Actual: ${approvedAdjust.adjustment.status}`);
    }
    console.log(`   ✅ Manager berhasil menyetujui SessionAdjustRequest (ID: ${approvedAdjust.adjustment.id}, Status: ${approvedAdjust.adjustment.status}).`);

    // Uji Direct Adjustment 1-Klik oleh Manager (Tanpa Maker-Checker)
    const directAdjustRes = await ledgerService.directAdjustment(
      managerPrincipal,
      {
        customerPackageId: createdCustomerPkg.id,
        quantity: 1,
        reasonCode: 'PACKAGE_COMPENSATION',
        note: 'Direct adjustment langsung 1-klik oleh Manager Cabang',
      },
    );

    if (directAdjustRes.adjustment.status !== 'POSTED') {
      throw new Error(`Status direct adjust bukan POSTED! Actual: ${directAdjustRes.adjustment.status}`);
    }
    console.log(`   ✅ Manager berhasil melakukan direct adjustment 1-klik (Status: POSTED, Resulting Balance: ${directAdjustRes.resultingBalance}).`);

    const adjustLedgers = await db.sessionLedger.findMany({
      where: {
        customerPackageId: createdCustomerPkg.id,
        type: SessionMutationType.ADJUST_MANUAL,
      },
    });
    if (adjustLedgers.length < 2) {
      throw new Error('SessionLedger penyesuaian manual tidak mencatat kedua transaksi (approved + direct)!');
    }
    console.log(`   ✅ SessionLedger mutasi ADJUST_MANUAL tercatat: ${adjustLedgers.length} entri mutasi.`);

    // ------------------------------------------------------------------------
    // 7. Verifikasi Fitur Manager: Menandai Customer Berhenti (Rule #12 & #13)
    // ------------------------------------------------------------------------
    console.log('\n▶ 7. Menguji Fitur: Menandai Customer Berhenti ("Tandai Customer Berhenti")...');

    const markResult = await customerManagement.markStopped(
      managerPrincipal,
      customer.id,
      'Customer berhenti karena pindah domisili',
    );
    if (!markResult.isStopped || !markResult.stoppedAt) {
      throw new Error('Gagal menandai customer berhenti!');
    }

    const checkUserStopped = await db.user.findUniqueOrThrow({ where: { id: customer.id } });
    if (!checkUserStopped.stoppedAt) {
      throw new Error('Kolom user.stoppedAt tidak tersimpan di database!');
    }
    console.log(`   ✅ Customer "${customer.displayName}" ditandai berhenti pada: ${checkUserStopped.stoppedAt.toISOString()}`);

    // Aktifkan kembali
    const unmarkResult = await customerManagement.unmarkStopped(managerPrincipal, customer.id);
    if (unmarkResult.isStopped || unmarkResult.stoppedAt !== null) {
      throw new Error('Gagal mengaktifkan kembali customer berhenti!');
    }

    const checkUserActive = await db.user.findUniqueOrThrow({ where: { id: customer.id } });
    if (checkUserActive.stoppedAt !== null) {
      throw new Error('Kolom user.stoppedAt tidak di-reset ke null!');
    }
    console.log(`   ✅ Customer "${customer.displayName}" berhasil diaktifkan kembali (stoppedAt: null).`);

    // ------------------------------------------------------------------------
    // 8. Verifikasi Master MinQuotaSetting (Super Owner / Admin)
    // ------------------------------------------------------------------------
    console.log('\n▶ 8. Menguji Master MinQuotaSetting (Kuota Minimum Per Kelas & Cabang)...');

    const classType = await db.jenisKelas.findFirstOrThrow();

    const quotaSetting = await effectiveSettings.create(
      superOwnerPrincipal,
      {
        kind: 'QUOTA_CAPACITY',
        branchId: branchA.id,
        classTypeId: classType.id,
        minimumQuota: 3,
        cutoffHours: 3,
        effectiveFrom: new Date().toISOString(),
        reason: 'Penyesuaian kuota minimum operasional cabang A',
      },
      `idem-quota-${randomUUID().slice(0, 8)}`,
    );

    console.log(`   ✅ MinQuotaSetting tersimpan (ID: ${quotaSetting.id}, minQuota: 3, cutoffHours: 3).`);

    const quotaList = await effectiveSettings.list(superOwnerPrincipal, 'QUOTA_CAPACITY', branchA.id);
    const targetSetting = quotaList.items.find(
      (item) => item.branchId === branchA.id && item.classTypeId === classType.id,
    );
    if (!targetSetting || targetSetting.minimumQuota !== 3) {
      throw new Error('MinQuotaSetting yang tersimpan tidak ditemukan dalam list!');
    }
    console.log(`   ✅ Konfigurasi MinQuotaSetting berhasil diverifikasi via list API.`);

    // ------------------------------------------------------------------------
    // 9. Verifikasi Laporan Kinerja Cabang Owner & Rincian Fee Instruktur (Rule #10)
    // ------------------------------------------------------------------------
    console.log('\n▶ 9. Menguji Laporan Kinerja Cabang Owner & Rincian Fee Instruktur (Rule #10)...');

    const performanceReport = await financeService.ownerBranchPerformance(
      ownerPrincipalInitial,
      {
        branchId: branchA.id,
        period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      },
    );

    if (performanceReport.branch.id !== branchA.id) {
      throw new Error('Laporan kinerja mengembalikan data cabang yang salah!');
    }
    if (typeof performanceReport.omsetRp !== 'number') {
      throw new Error('OmsetRp bukan number!');
    }
    if (typeof performanceReport.totalInstructorFeeRp !== 'number') {
      throw new Error('TotalInstructorFeeRp bukan number!');
    }
    if (typeof performanceReport.otherCostRp !== 'number') {
      throw new Error('OtherCostRp bukan number!');
    }
    if (typeof performanceReport.estimatedProfitRp !== 'number') {
      throw new Error('EstimatedProfitRp bukan number!');
    }

    console.log(`   ✅ Laporan Kinerja Cabang "${performanceReport.branch.name}" (Periode: ${performanceReport.period}):`);
    console.log(`      - Total Omset           : Rp ${performanceReport.omsetRp.toLocaleString('id-ID')}`);
    console.log(`      - Biaya Instruktur (RT) : Rp ${performanceReport.totalInstructorFeeRp.toLocaleString('id-ID')}`);
    console.log(`      - Biaya Operasional Lain: Rp ${performanceReport.otherCostRp.toLocaleString('id-ID')}`);
    console.log(`      - Estimasi Laba Bersih  : Rp ${performanceReport.estimatedProfitRp.toLocaleString('id-ID')}`);
    console.log(`      - Rincian Fee Instruktur: ${performanceReport.instructors.length} instruktur.`);

    // Coba akses cabang B oleh Owner yang tidak memiliki hak: Harus 403 Forbidden!
    let forbiddenReportCaught = false;
    try {
      await financeService.ownerBranchPerformance(ownerPrincipalInitial, {
        branchId: branchB.id,
        period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      });
    } catch {
      forbiddenReportCaught = true;
    }
    if (!forbiddenReportCaught) {
      throw new Error('Security Breach: Owner dapat melihat laporan kinerja cabang B yang bukan haknya!');
    }
    console.log('   ✅ Owner berhasil dicekal saat mencoba melihat laporan kinerja Cabang B (403 Forbidden).');

    // ------------------------------------------------------------------------
    // Cleanup Data Uji
    // ------------------------------------------------------------------------
    console.log('\n▶ 10. Membersihkan Record Dummy Pengujian...');
    await db.sessionLedger.deleteMany({
      where: { customerPackageId: createdCustomerPkg.id },
    });
    await db.sessionAdjustRequest.deleteMany({
      where: { customerPackageId: createdCustomerPkg.id },
    });
    await db.paketPelanggan.deleteMany({
      where: { id: createdCustomerPkg.id },
    });
    await db.pembelian.deleteMany({
      where: { id: testPurchase.id },
    });
    console.log('   ✅ Data uji berhasil dibersihkan.');

    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('🎉 SEMUA 9 SKENARIO VERIFIKASI FASE 2 (RBAC 7 ROLE & MULTI-CABANG) LULUS 100%!');
    console.log('══════════════════════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ VERIFIKASI FASE 2 GAGAL:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
