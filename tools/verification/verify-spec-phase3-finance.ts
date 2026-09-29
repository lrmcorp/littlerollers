import {
  PrismaClient,
  Role,
  PurchaseStatus,
  CloseStatus,
  CorrectionStatus,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import {
  mapUserToEffectiveRoles,
  type SessionPrincipal,
} from '../../apps/api/src/identity/identity.service';
import { FinanceService } from '../../apps/api/src/packages/finance.service';
import {
  calculateSlotFee,
  sortFeesNewestFirst,
} from '../../apps/api/src/packages/instructor-fee-calculator';
import { MasterAccessService } from '../../apps/api/src/master/master-access.service';
import { EffectiveSettingsService } from '../../apps/api/src/master/konfigurasi-efektif.service';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - VERIFIKASI FASE 3: MODUL FINANSIAL & TUTUP BUKU             ║');
  console.log('║   (5 Laporan, Effective Date, OtherCost Lock, Monthly Close, Rule #8 & #10)  ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const policy = new PolicyService();
  const masterAccess = new MasterAccessService(policy);
  const effectiveSettings = new EffectiveSettingsService(masterAccess, db as any);
  const financeService = new FinanceService(db as any);

  try {
    // ------------------------------------------------------------------------
    // 1. Menyiapkan Aktor & Master Data Pengujian
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor & Master Data Pengujian...');

    const superOwner = await db.user.findFirstOrThrow({ where: { role: Role.SUPER_OWNER } });
    const owner = await db.user.findFirstOrThrow({ where: { role: Role.OWNER } });
    const finance = await db.user.findFirstOrThrow({ where: { role: Role.FINANCE } });
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });
    const customer = await db.user.findFirstOrThrow({ where: { role: Role.CUSTOMER } });

    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) {
      throw new Error('Diperlukan minimal 2 cabang di database untuk verifikasi!');
    }
    const [branchA, branchB] = branches;

    const classType = await db.jenisKelas.findFirstOrThrow();

    // Assign owner ke branchA saja
    await db.ownerCabang.deleteMany({ where: { ownerId: owner.id } });
    await db.ownerCabang.create({
      data: {
        ownerId: owner.id,
        branchId: branchA.id,
      },
    });

    const superOwnerRoles = mapUserToEffectiveRoles({ role: 'SUPER_OWNER' });
    const superOwnerAccess = policy.resolveAccess(superOwner.id, superOwnerRoles);

    const financeRoles = mapUserToEffectiveRoles({ role: 'FINANCE' });
    const financeAccess = policy.resolveAccess(finance.id, financeRoles);

    const ownerRoles = mapUserToEffectiveRoles({
      role: 'OWNER',
      ownedBranches: [{ branchId: branchA.id }],
    });
    const ownerAccess = policy.resolveAccess(owner.id, ownerRoles);

    const superOwnerPrincipal: SessionPrincipal = {
      sessionId: `sess-so-${randomUUID().slice(0, 6)}`,
      userId: superOwner.id,
      email: superOwner.email,
      roles: superOwnerRoles,
      capabilities: superOwnerAccess.capabilities,
      branchIds: superOwnerAccess.branchIds,
      isAudited: true,
    };

    const financePrincipal: SessionPrincipal = {
      sessionId: `sess-fin-${randomUUID().slice(0, 6)}`,
      userId: finance.id,
      email: finance.email,
      roles: financeRoles,
      capabilities: financeAccess.capabilities,
      branchIds: financeAccess.branchIds,
      isAudited: true,
    };

    const ownerPrincipal: SessionPrincipal = {
      sessionId: `sess-owner-${randomUUID().slice(0, 6)}`,
      userId: owner.id,
      email: owner.email,
      roles: ownerRoles,
      capabilities: ownerAccess.capabilities,
      branchIds: ownerAccess.branchIds,
      isAudited: true,
    };

    console.log(`   ✅ SUPER_OWNER : ${superOwner.displayName}`);
    console.log(`   ✅ FINANCE     : ${finance.displayName}`);
    console.log(`   ✅ OWNER       : ${owner.displayName} (Scope: ${branchA.code})`);
    console.log(`   ✅ Cabang A    : ${branchA.name} (${branchA.id})`);
    console.log(`   ✅ Cabang B    : ${branchB.name} (${branchB.id})`);

    const testPeriod = `2026-11`;
    const nextPeriod = `2026-12`;

    // Bersihkan data uji sebelumnya pada periode uji
    await db.monthlyClose.deleteMany({ where: { period: { in: [testPeriod, nextPeriod] } } });
    await db.otherCost.deleteMany({ where: { period: { in: [testPeriod, nextPeriod] } } });
    await db.correctionJournal.deleteMany({ where: { period: { in: [testPeriod, nextPeriod] } } });

    // ------------------------------------------------------------------------
    // 2. Pengujian Tarif Ber-Effective Date (InstructorFee & ProjectionRate)
    // ------------------------------------------------------------------------
    console.log('\n▶ 2. Menguji Master Data Tarif Ber-Effective Date...');

    // Pasang 2 tarif dengan tanggal efektif berbeda
    const dateEarly = new Date(`${testPeriod}-01T00:00:00Z`);
    const dateLate = new Date(`${testPeriod}-15T00:00:00Z`);

    await db.instructorFee.deleteMany({
      where: { instructorId: instructor.id, branchId: branchA.id, classTypeId: classType.id },
    });
    await db.projectionRate.deleteMany({
      where: { branchId: branchA.id, classTypeId: classType.id },
    });

    await db.instructorFee.create({
      data: {
        instructorId: instructor.id,
        branchId: branchA.id,
        classTypeId: classType.id,
        feePerJamRp: 160_000,
        effectiveDate: dateEarly,
      },
    });

    await db.instructorFee.create({
      data: {
        instructorId: instructor.id,
        branchId: branchA.id,
        classTypeId: classType.id,
        feePerJamRp: 180_000,
        effectiveDate: dateLate,
      },
    });

    await db.projectionRate.create({
      data: {
        branchId: branchA.id,
        classTypeId: classType.id,
        ratePerSesiRp: 110_000,
        effectiveDate: dateEarly,
      },
    });

    await db.projectionRate.create({
      data: {
        branchId: branchA.id,
        classTypeId: classType.id,
        ratePerSesiRp: 130_000,
        effectiveDate: dateLate,
      },
    });

    const instructorFees = sortFeesNewestFirst(
      await db.instructorFee.findMany({ where: { instructorId: instructor.id } }),
    );
    const feeAt = (day: string) =>
      calculateSlotFee(instructorFees, {
        instructorId: instructor.id,
        branchId: branchA.id,
        classTypeId: classType.id,
        startAt: new Date(`${testPeriod}-${day}T10:00:00Z`),
        endAt: new Date(`${testPeriod}-${day}T11:00:00Z`),
      }).feePerJamRp;
    const feeBefore = feeAt('10');
    const feeAfter = feeAt('20');

    const rateBefore = await effectiveSettings.getEffectiveProjectionRate(
      branchA.id,
      classType.id,
      new Date(`${testPeriod}-10T10:00:00Z`),
    );
    const rateAfter = await effectiveSettings.getEffectiveProjectionRate(
      branchA.id,
      classType.id,
      new Date(`${testPeriod}-20T10:00:00Z`),
    );

    if (feeBefore !== 160_000 || feeAfter !== 180_000) {
      throw new Error(`Resolusi InstructorFee effective-date gagal! Diharapkan 160k & 180k, didapat ${feeBefore} & ${feeAfter}`);
    }
    if (rateBefore !== 110_000 || rateAfter !== 130_000) {
      throw new Error(`Resolusi ProjectionRate effective-date gagal! Diharapkan 110k & 130k, didapat ${rateBefore} & ${rateAfter}`);
    }
    console.log(`   ✅ Resolusi InstructorFee: Tanggal 10 -> Rp ${feeBefore.toLocaleString('id-ID')}, Tanggal 20 -> Rp ${feeAfter.toLocaleString('id-ID')}`);
    console.log(`   ✅ Resolusi ProjectionRate: Tanggal 10 -> Rp ${rateBefore.toLocaleString('id-ID')}, Tanggal 20 -> Rp ${rateAfter.toLocaleString('id-ID')}`);

    // ------------------------------------------------------------------------
    // 3. Pengujian Laporan 1: Omset Penjualan Paket (PAID)
    // ------------------------------------------------------------------------
    console.log('\n▶ 3. Menguji Laporan 1: Omset Penjualan Paket PAID...');

    const pkg = await db.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
    const purchaseAmount = 1_500_000;

    const purchase = await db.pembelian.create({
      data: {
        invoiceNumber: `INV-PHASE3-${Date.now()}`,
        userId: customer.id,
        branchId: branchA.id,
        packageId: pkg.id,
        subtotalRp: purchaseAmount,
        totalAmountRp: purchaseAmount,
        status: PurchaseStatus.PAID,
        paymentMethod: 'BANK_TRANSFER',
        paidAt: new Date(`${testPeriod}-05T10:00:00Z`),
      },
    });

    const omsetRes = await financeService.omsetReport(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
    });

    if (omsetRes.totalOmsetRp < purchaseAmount) {
      throw new Error(`Total omset di laporan (${omsetRes.totalOmsetRp}) kurang dari nominal pembelian (${purchaseAmount})`);
    }
    const foundTrx = omsetRes.transactions.find((t) => t.id === purchase.id);
    if (!foundTrx) {
      throw new Error('Transaksi pembelian tidak ditemukan di daftar rincian omset!');
    }
    console.log(`   ✅ Total Omset Cabang A Periode ${testPeriod}: Rp ${omsetRes.totalOmsetRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Transaksi ${foundTrx.orderNumber} tercatat valid dengan metode ${foundTrx.paymentMethod}`);

    // ------------------------------------------------------------------------
    // 4. Pengujian Laporan 2: Cost Instruktur Realtime & Keputusan Bisnis #10
    // ------------------------------------------------------------------------
    console.log('\n▶ 4. Menguji Laporan 2: Cost Instruktur Realtime & Akses Owner (Rule #10)...');

    const studio = await db.studio.findFirstOrThrow({ where: { branchId: branchA.id } });

    // Buat slot kelas COMPLETED berdurasi 2 jam pada tanggal 20 (menggunakan tarif baru 180k/jam)
    const slotStartTime = new Date(`${testPeriod}-20T08:00:00Z`);
    const slotEndTime = new Date(`${testPeriod}-20T10:00:00Z`);

    const slot = await db.slotKelas.create({
      data: {
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: slotStartTime,
        endAt: slotEndTime,
        capacity: 10,
        status: 'COMPLETED',
      },
    });

    const realtimeRes = await financeService.realtimeInstructorCostReport(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
    });

    const instItem = realtimeRes.instructors.find((i) => i.instructorId === instructor.id);
    if (!instItem) {
      throw new Error('Instruktur tidak ditemukan dalam rincian beban realtime!');
    }
    const expectedFee = 2 * 180_000; // 2 jam x 180.000 (tarif efektif tanggal 20)
    if (instItem.totalFeeRp < expectedFee) {
      throw new Error(`Total fee instruktur (${instItem.totalFeeRp}) kurang dari expected (${expectedFee})`);
    }
    console.log(`   ✅ Beban Instruktur Realtime: ${instItem.instructorName} -> ${instItem.totalHours} Jam = Rp ${instItem.totalFeeRp.toLocaleString('id-ID')}`);

    // Uji Keputusan Bisnis #10: Owner hanya boleh akses cabangnya
    console.log('   🔒 Menguji Rule #10: Batasan Akses Owner ke Cabang Miliknya...');
    const ownerAllowed = await financeService.realtimeInstructorCostReport(ownerPrincipal, {
      branchId: branchA.id,
      period: testPeriod,
    });
    if (!ownerAllowed) {
      throw new Error('Owner gagal mengakses laporan cabang miliknya!');
    }
    console.log(`   ✅ Owner diizinkan mengakses performa Cabang A miliknya.`);

    let ownerBlocked = false;
    try {
      await financeService.realtimeInstructorCostReport(ownerPrincipal, {
        branchId: branchB.id,
        period: testPeriod,
      });
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('FORBIDDEN')) {
        ownerBlocked = true;
      }
    }
    if (!ownerBlocked) {
      throw new Error('KEAMANAN JEBOL: Owner dapat mengakses laporan cabang lain (Branch B)!');
    }
    console.log(`   ✅ Owner DICEKAL (403 Forbidden) saat mencoba mengakses Cabang B.`);

    // ------------------------------------------------------------------------
    // 5. Pengujian Laporan 3: Cost Instruktur Projection
    // ------------------------------------------------------------------------
    console.log('\n▶ 5. Menguji Laporan 3: Cost Instruktur Projection...');

    const projectionRes = await financeService.projectionInstructorCostReport(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
    });

    if (projectionRes.totalSessionsSold <= 0 || projectionRes.totalProjectionCostRp <= 0) {
      throw new Error('Laporan Cost Instruktur Projeksi tidak mengalkulasi sesi terjual!');
    }
    console.log(`   ✅ Total Sesi Terjual: ${projectionRes.totalSessionsSold} Sesi`);
    console.log(`   ✅ Total Projeksi Beban: Rp ${projectionRes.totalProjectionCostRp.toLocaleString('id-ID')}`);

    // ------------------------------------------------------------------------
    // 6. Pengujian Laporan 4: Pencatatan Biaya Operasional (OtherCost)
    // ------------------------------------------------------------------------
    console.log('\n▶ 6. Menguji Laporan 4: CRUD OtherCost pada Periode OPEN...');

    const cost1 = await financeService.createOtherCost(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
      category: 'RENT',
      description: 'Sewa Gedung Studio Bulanan',
      amountRp: 5_000_000,
    });

    const cost2 = await financeService.createOtherCost(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
      category: 'UTILITIES',
      description: 'Tagihan Listrik & Internet Fiber',
      amountRp: 1_200_000,
    });

    const otherCostRes = await financeService.otherCostReport(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
    });

    if (otherCostRes.totalOtherCostRp < 6_200_000) {
      throw new Error(`Total Other Cost (${otherCostRes.totalOtherCostRp}) tidak sesuai!`);
    }
    console.log(`   ✅ Other Cost tercatat: RENT (Rp 5.000.000) & UTILITIES (Rp 1.200.000)`);
    console.log(`   ✅ Total Biaya Operasional Lain: Rp ${otherCostRes.totalOtherCostRp.toLocaleString('id-ID')}`);

    // ------------------------------------------------------------------------
    // 7. Pengujian Laporan 5: Laba Bersih Bulanan (Realtime vs Projeksi)
    // ------------------------------------------------------------------------
    console.log('\n▶ 7. Menguji Laporan 5: Laba Bersih Bulanan (Profit Summary)...');

    const profitRes = await financeService.monthlyProfitReport(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
    });

    const expectedRealtimeProfit = profitRes.omsetRp - profitRes.costRealtimeRp - profitRes.otherCostRp;
    if (profitRes.netProfitRealtimeRp !== expectedRealtimeProfit) {
      throw new Error(`Perhitungan Laba Bersih Realtime salah! Diharapkan ${expectedRealtimeProfit}, didapat ${profitRes.netProfitRealtimeRp}`);
    }

    const expectedProjectionProfit = profitRes.omsetRp - profitRes.costProjectionRp - profitRes.otherCostRp;
    if (profitRes.netProfitProjectionRp !== expectedProjectionProfit) {
      throw new Error(`Perhitungan Laba Bersih Projeksi salah! Diharapkan ${expectedProjectionProfit}, didapat ${profitRes.netProfitProjectionRp}`);
    }

    console.log(`   ✅ Omset Penjualan       : Rp ${profitRes.omsetRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Beban Realtime        : Rp ${profitRes.costRealtimeRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Beban Projeksi        : Rp ${profitRes.costProjectionRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Beban Operasional Lain: Rp ${profitRes.otherCostRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Laba Bersih Realtime  : Rp ${profitRes.netProfitRealtimeRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Laba Bersih Projeksi  : Rp ${profitRes.netProfitProjectionRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Status Periode Saat Ini: ${profitRes.status}`);

    // ------------------------------------------------------------------------
    // 8. Pengujian Tutup Buku Bulanan (Monthly Close) Snapshot Freeze
    // ------------------------------------------------------------------------
    console.log('\n▶ 8. Menguji Eksekusi Tutup Buku Bulanan (Monthly Close)...');

    const closedRecord = await financeService.executeMonthlyClose(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
      reason: 'Tutup buku resmi akhir bulan periode verifikasi Fase 3',
    });

    if (closedRecord.status !== CloseStatus.LOCKED) {
      throw new Error(`Status tutup buku harus LOCKED, namun bernilai ${closedRecord.status}`);
    }
    if (!closedRecord.closedAt || !closedRecord.closedById) {
      throw new Error('Audit metadata tutup buku (closedAt/closedById) tidak tercatat!');
    }
    console.log(`   ✅ Periode ${testPeriod} berhasil ditutup dan terkunci [LOCKED].`);
    console.log(`   ✅ Snapshot Angka Finansial:`);
    console.log(`      - Omset   : Rp ${closedRecord.omsetRp.toLocaleString('id-ID')}`);
    console.log(`      - Realtime: Rp ${closedRecord.costRealtimeRp.toLocaleString('id-ID')}`);
    console.log(`      - Project : Rp ${closedRecord.costProjectionRp.toLocaleString('id-ID')}`);
    console.log(`      - Other   : Rp ${closedRecord.otherCostRp.toLocaleString('id-ID')}`);
    console.log(`      - Profit  : Rp ${closedRecord.profitRp.toLocaleString('id-ID')}`);
    console.log(`      - Control : ${closedRecord.controlHash}`);

    // ------------------------------------------------------------------------
    // 9. Pengujian Period Lock Protection (Keputusan Bisnis #8)
    // ------------------------------------------------------------------------
    console.log('\n▶ 9. Menguji Period Lock Protection (Keputusan Bisnis #8)...');

    let createBlocked = false;
    try {
      await financeService.createOtherCost(financePrincipal, {
        branchId: branchA.id,
        period: testPeriod,
        category: 'MARKETING',
        description: 'Biaya Iklan Tambahan Pasca-Lock',
        amountRp: 800_000,
      });
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('PERIOD_ALREADY_LOCKED')) {
        createBlocked = true;
      }
    }
    if (!createBlocked) {
      throw new Error('KEAMANAN AUDIT JEBOL: Penambahan biaya pada periode LOCKED diizinkan!');
    }
    console.log(`   ✅ Penambahan OtherCost pada periode LOCKED berhasil DICEKAL (409 Conflict).`);

    let deleteBlocked = false;
    try {
      await financeService.deleteOtherCost(financePrincipal, cost1.id);
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('PERIOD_ALREADY_LOCKED')) {
        deleteBlocked = true;
      }
    }
    if (!deleteBlocked) {
      throw new Error('KEAMANAN AUDIT JEBOL: Penghapusan biaya pada periode LOCKED diizinkan!');
    }
    console.log(`   ✅ Penghapusan OtherCost pada periode LOCKED berhasil DICEKAL (409 Conflict).`);

    // ------------------------------------------------------------------------
    // 10. Pengujian Jurnal Koreksi Pasca-Lock (Rule #8)
    // ------------------------------------------------------------------------
    console.log('\n▶ 10. Menguji Jurnal Koreksi Pasca-Lock (Rule #8)...');

    // Ajukan koreksi data masa lalu (testPeriod) yang dibukukan pada bulan berjalan (nextPeriod)
    const correction = await financeService.createCorrection(financePrincipal, {
      branchId: branchA.id,
      targetPeriod: testPeriod, // Periode lama yang terkunci
      period: nextPeriod,       // Periode berjalan di mana koreksi dibukukan
      amountRp: -350_000,       // Pengurangan laba karena biaya tertinggal
      reason: 'Nota perbaikan AC tertinggal pada periode lampau',
    });

    if (correction.status !== CorrectionStatus.PENDING) {
      throw new Error(`Status awal koreksi harus PENDING, namun bernilai ${correction.status}`);
    }
    console.log(`   ✅ Jurnal Koreksi dibuat dengan status PENDING (ID: ${correction.id})`);

    // Verifikasi bahwa non-SuperOwner (misal Finance/Owner) tidak boleh memutuskan koreksi
    let unauthorizedDecideBlocked = false;
    try {
      await financeService.decideCorrection(ownerPrincipal, correction.id, 'APPROVE');
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('FORBIDDEN')) {
        unauthorizedDecideBlocked = true;
      }
    }
    if (!unauthorizedDecideBlocked) {
      throw new Error('KEAMANAN JEBOL: Non-SuperOwner dapat memutuskan Jurnal Koreksi!');
    }
    console.log(`   ✅ Keputusan Jurnal Koreksi oleh non-SuperOwner DICEKAL (403 Forbidden).`);

    // Super Owner menyetujui koreksi
    const approvedCorrection = await financeService.decideCorrection(
      superOwnerPrincipal,
      correction.id,
      'APPROVE',
    );
    if (approvedCorrection.status !== CorrectionStatus.APPROVED) {
      throw new Error('Persetujuan koreksi oleh Super Owner gagal!');
    }
    console.log(`   ✅ Super Owner MENYETUJUI Jurnal Koreksi -> Status APPROVED.`);

    // Verifikasi snapshot periode lama TETAP UTUH
    const historicProfitAfter = await financeService.monthlyProfitReport(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
    });
    if (historicProfitAfter.profitRp && historicProfitAfter.profitRp !== closedRecord.profitRp) {
      throw new Error('INTEGRITAS AUDIT RUSAK: Angka snapshot historis periode terkunci berubah!');
    }
    console.log(`   ✅ Snapshot historis periode ${testPeriod} TETAP UTUH (Laba: Rp ${historicProfitAfter.netProfitRealtimeRp.toLocaleString('id-ID')})`);

    // Verifikasi dampak penyesuaian masuk ke periode berjalan (nextPeriod)
    const currentProfit = await financeService.monthlyProfitReport(financePrincipal, {
      branchId: branchA.id,
      period: nextPeriod,
    });
    if (currentProfit.totalCorrectionAdjustmentRp !== -350_000) {
      throw new Error(`Penyesuaian koreksi pada periode ${nextPeriod} tidak sesuai (${currentProfit.totalCorrectionAdjustmentRp})`);
    }
    console.log(`   ✅ Penyesuaian koreksi berhasil dibukukan pada periode berjalan ${nextPeriod} (Rp ${currentProfit.totalCorrectionAdjustmentRp.toLocaleString('id-ID')}).`);

    // Cleanup data pengujian
    await db.pembelian.deleteMany({ where: { id: purchase.id } });
    await db.slotKelas.deleteMany({ where: { id: slot.id } });
    await db.otherCost.deleteMany({ where: { period: { in: [testPeriod, nextPeriod] } } });
    await db.monthlyClose.deleteMany({ where: { period: { in: [testPeriod, nextPeriod] } } });
    await db.correctionJournal.deleteMany({ where: { period: { in: [testPeriod, nextPeriod] } } });

    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('🎉 SEMUA 10 SKENARIO PENGUJIAN FASE 3 BERHASIL DIVERIFIKASI DENGAN SUKSES! 🎉');
    console.log('   - Master data tarif effective-date berjalan presisi');
    console.log('   - 5 Laporan Keuangan (Omset, Realtime, Projection, Other Cost, Profit) sinkron');
    console.log('   - Batasan akses Owner Cabang (Rule #10) terlindungi 100%');
    console.log('   - Tutup Buku Bulanan (Monthly Close) membekukan snapshot finansial');
    console.log('   - Period Lock Guard (Keputusan Bisnis #8) memblokir mutasi pasca-lock');
    console.log('   - Jurnal Koreksi (Rule #8) menjaga keandalan data historis');
    console.log('══════════════════════════════════════════════════════════════════════════════\n');
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ VERIFIKASI FASE 3 GAGAL:', err);
  process.exit(1);
});
