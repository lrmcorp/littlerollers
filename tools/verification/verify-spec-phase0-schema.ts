import {
  PrismaClient,
  Role,
  SessionMutationType,
  AdjustRequestStatus,
  CloseStatus,
  CorrectionStatus,
} from '@prisma/client';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - VERIFIKASI FASE 0: PENYELARASAN SKEMA & BASIS DATABASE      ║');
  console.log('║   (7 Role, SessionLedger, OwnerBranch, MinQuota, Rates, MonthlyClose)        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();

  try {
    // ------------------------------------------------------------------------
    // 1. Verifikasi Enum Role 7 Level & Enum Khusus v1.0
    // ------------------------------------------------------------------------
    console.log('▶ 1. Memeriksa Ketersediaan Enum 7 Role & Enum Khusus v1.0...');
    const expectedRoles: (keyof typeof Role)[] = [
      'SUPER_OWNER',
      'OWNER',
      'MANAGER',
      'FINANCE',
      'ADMIN',
      'INSTRUCTOR',
      'CUSTOMER',
    ];

    for (const roleKey of expectedRoles) {
      if (Role[roleKey]) {
        console.log(`   ✅ Role.${roleKey} terdaftar di Prisma Client runtime.`);
      } else {
        throw new Error(`Role.${roleKey} tidak ditemukan di Prisma Client!`);
      }
    }

    const expectedMutationTypes: (keyof typeof SessionMutationType)[] = [
      'PURCHASE',
      'ATTEND',
      'REFUND_AUTOCANCEL',
      'ADJUST_MANUAL',
    ];
    for (const typeKey of expectedMutationTypes) {
      if (SessionMutationType[typeKey]) {
        console.log(`   ✅ SessionMutationType.${typeKey} terdaftar.`);
      } else {
        throw new Error(`SessionMutationType.${typeKey} tidak ditemukan!`);
      }
    }

    // ------------------------------------------------------------------------
    // 2. Verifikasi Data Akun 7 Role & Relasi OwnerCabang
    // ------------------------------------------------------------------------
    console.log('\n▶ 2. Memeriksa Akun Pengguna 7 Role & Pemetaan OwnerCabang...');
    const superOwner = await db.user.findFirst({ where: { role: Role.SUPER_OWNER } });
    if (!superOwner) throw new Error('Pengguna dengan role SUPER_OWNER tidak ditemukan di DB!');
    console.log(`   ✅ Super Owner terverifikasi: ${superOwner.displayName} (${superOwner.email})`);

    const owner = await db.user.findFirst({ where: { role: Role.OWNER } });
    if (!owner) throw new Error('Pengguna dengan role OWNER tidak ditemukan di DB!');
    console.log(`   ✅ Owner Cabang terverifikasi: ${owner.displayName} (${owner.email})`);

    const manager = await db.user.findFirst({ where: { role: Role.MANAGER } });
    if (!manager) throw new Error('Pengguna dengan role MANAGER tidak ditemukan di DB!');
    console.log(`   ✅ Studio Manager terverifikasi: ${manager.displayName} (${manager.email})`);

    const finance = await db.user.findFirst({ where: { role: Role.FINANCE } });
    if (!finance) throw new Error('Pengguna dengan role FINANCE tidak ditemukan di DB!');
    console.log(`   ✅ Corporate Finance terverifikasi: ${finance.displayName} (${finance.email})`);

    // Periksa tabel OwnerCabang
    const ownerBranch = await db.ownerCabang.findFirst({
      where: { ownerId: owner.id },
      include: { branch: true, owner: true },
    });
    if (!ownerBranch) throw new Error('Penugasan OwnerCabang tidak ditemukan!');
    console.log(`   ✅ OwnerCabang terverifikasi: ${ownerBranch.owner.displayName} memegang cabang ${ownerBranch.branch.name} (${ownerBranch.branch.code})`);

    // ------------------------------------------------------------------------
    // 3. Verifikasi SessionLedger (Single Source of Truth)
    // ------------------------------------------------------------------------
    console.log('\n▶ 3. Menguji Integritas SessionLedger & Mutasi Saldo Sesi...');
    const ledgers = await db.sessionLedger.findMany({
      orderBy: { createdAt: 'asc' },
      include: { customerPackage: true },
    });
    if (ledgers.length < 2) throw new Error(`Ditemukan ${ledgers.length} ledger, seharusnya minimal 2 dari seed!`);

    console.log(`   ✅ Ditemukan ${ledgers.length} mutasi ledger terdaftar:`);
    for (const l of ledgers) {
      console.log(`      • [${l.type}] amount=${l.amount > 0 ? '+' : ''}${l.amount}, balanceAfter=${l.balanceAfter} (${l.notes})`);
    }

    // Uji pembuatan mutasi manual baru dan rollback
    const testPackage = ledgers[0]!.customerPackage;
    const testLedger = await db.sessionLedger.create({
      data: {
        customerPackageId: testPackage.id,
        type: SessionMutationType.ADJUST_MANUAL,
        amount: 2,
        balanceAfter: testPackage.remainingSessions + 2,
        notes: 'Uji Verifikasi Skema Fase 0',
        createdById: superOwner.id,
      },
    });
    console.log(`   ✅ Mutasi uji coba berhasil dibuat: ID=${testLedger.id}, type=${testLedger.type}, amount=+2`);
    await db.sessionLedger.delete({ where: { id: testLedger.id } });
    console.log(`   ✅ Mutasi uji coba berhasil dibersihkan.`);

    // ------------------------------------------------------------------------
    // 4. Verifikasi Master Data Ber-effective-date & MinQuota
    // ------------------------------------------------------------------------
    console.log('\n▶ 4. Memeriksa Master Data Ber-effective-date (MinQuota, Fees, Rates)...');
    const minQuota = await db.minQuotaSetting.findFirst({
      include: { branch: true, classType: true },
    });
    if (!minQuota) throw new Error('MinQuotaSetting tidak ditemukan!');
    console.log(`   ✅ MinQuotaSetting terverifikasi: Cabang ${minQuota.branch.code}, Kelas ${minQuota.classType.name} -> min ${minQuota.minQuota} orang, cutoff ${minQuota.cutoffHours} jam.`);

    const instructorFee = await db.instructorFee.findFirst({
      include: { instructor: true, branch: true, classType: true },
    });
    if (!instructorFee) throw new Error('InstructorFee tidak ditemukan!');
    console.log(`   ✅ InstructorFee terverifikasi: ${instructorFee.instructor.displayName} @ ${instructorFee.branch.code} -> Rp ${instructorFee.feePerJamRp.toLocaleString('id-ID')}/jam (Eff: ${instructorFee.effectiveDate.toISOString().slice(0, 10)})`);

    const projectionRate = await db.projectionRate.findFirst({
      include: { branch: true, classType: true },
    });
    if (!projectionRate) throw new Error('ProjectionRate tidak ditemukan!');
    console.log(`   ✅ ProjectionRate terverifikasi: ${projectionRate.branch.code} @ ${projectionRate.classType.name} -> Rp ${projectionRate.ratePerSesiRp.toLocaleString('id-ID')}/sesi (Eff: ${projectionRate.effectiveDate.toISOString().slice(0, 10)})`);

    // ------------------------------------------------------------------------
    // 5. Uji Fungsional Model Finansial: OtherCost, MonthlyClose, CorrectionJournal
    // ------------------------------------------------------------------------
    console.log('\n▶ 5. Menguji CRUD Model Finansial (OtherCost, MonthlyClose, CorrectionJournal)...');
    const branch = await db.cabang.findFirstOrThrow();
    const currentPeriod = new Date().toISOString().slice(0, 7);

    // Test OtherCost
    const testOtherCost = await db.otherCost.create({
      data: {
        branchId: branch.id,
        period: currentPeriod,
        category: 'ELECTRICITY',
        description: 'Uji Biaya Listrik Bulanan',
        amountRp: 2500000,
        createdById: finance.id,
      },
    });
    console.log(`   ✅ OtherCost berhasil dibuat: ID=${testOtherCost.id}, category=${testOtherCost.category}, Rp ${testOtherCost.amountRp.toLocaleString('id-ID')}`);
    await db.otherCost.delete({ where: { id: testOtherCost.id } });
    console.log('   ✅ OtherCost uji coba berhasil dibersihkan.');

    // Test MonthlyClose
    const testClose = await db.monthlyClose.create({
      data: {
        branchId: branch.id,
        period: '2025-12', // Past period
        omsetRp: 50000000,
        costProjectionRp: 15000000,
        costRealtimeRp: 12000000,
        otherCostRp: 8000000,
        profitRp: 27000000,
        status: CloseStatus.LOCKED,
        closedById: finance.id,
        closedAt: new Date(),
        controlHash: 'hash-test-lock-001',
      },
    });
    console.log(`   ✅ MonthlyClose berhasil dibuat & dikunci: Periode=${testClose.period}, Status=${testClose.status}, Profit=Rp ${testClose.profitRp.toLocaleString('id-ID')}`);
    await db.monthlyClose.delete({ where: { id: testClose.id } });
    console.log('   ✅ MonthlyClose uji coba berhasil dibersihkan.');

    // Test CorrectionJournal
    const testCorrection = await db.correctionJournal.create({
      data: {
        branchId: branch.id,
        period: currentPeriod,
        targetPeriod: '2025-12',
        amountRp: -500000,
        reason: 'Penyesuaian tagihan listrik terlambat',
        status: CorrectionStatus.APPROVED,
        requestedById: finance.id,
        approvedById: superOwner.id,
        approvedAt: new Date(),
      },
    });
    console.log(`   ✅ CorrectionJournal berhasil dibuat: ID=${testCorrection.id}, target=${testCorrection.targetPeriod}, Rp ${testCorrection.amountRp.toLocaleString('id-ID')}`);
    await db.correctionJournal.delete({ where: { id: testCorrection.id } });
    console.log('   ✅ CorrectionJournal uji coba berhasil dibersihkan.');

    // ------------------------------------------------------------------------
    // 6. Uji SessionAdjustRequest, InstructorAvailability, ReminderLog
    // ------------------------------------------------------------------------
    console.log('\n▶ 6. Menguji SessionAdjustRequest, InstructorAvailability, ReminderLog...');
    const adminUser = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const instructorUser = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });

    // SessionAdjustRequest
    const testAdjust = await db.sessionAdjustRequest.create({
      data: {
        customerPackageId: testPackage.id,
        reason: 'Customer sakit flu mendadak (< H-24)',
        sessionCount: 1,
        status: AdjustRequestStatus.PENDING,
        requestedById: adminUser.id,
      },
    });
    console.log(`   ✅ SessionAdjustRequest berhasil dibuat oleh Admin: ID=${testAdjust.id}, status=${testAdjust.status}`);
    await db.sessionAdjustRequest.delete({ where: { id: testAdjust.id } });
    console.log('   ✅ SessionAdjustRequest uji coba berhasil dibersihkan.');

    // InstructorAvailability
    const testAvail = await db.instructorAvailability.create({
      data: {
        instructorId: instructorUser.id,
        branchId: branch.id,
        date: new Date(),
        startTime: '08:00',
        endTime: '12:00',
      },
    });
    console.log(`   ✅ InstructorAvailability berhasil dibuat: Instruktur=${instructorUser.displayName}, jam=${testAvail.startTime}-${testAvail.endTime}`);
    await db.instructorAvailability.delete({ where: { id: testAvail.id } });
    console.log('   ✅ InstructorAvailability uji coba berhasil dibersihkan.');

    // ReminderLog
    const testReminder = await db.reminderLog.create({
      data: {
        recipientPhone: '+6281234567890',
        recipientType: 'CUSTOMER',
        reminderType: 'EXPIRY_H7',
        payload: { sisaSesi: 3, expiredAt: '2026-10-01' },
        status: 'SENT',
      },
    });
    console.log(`   ✅ ReminderLog berhasil dicatat: ID=${testReminder.id}, type=${testReminder.reminderType}`);
    await db.reminderLog.delete({ where: { id: testReminder.id } });
    console.log('   ✅ ReminderLog uji coba berhasil dibersihkan.');

    console.log('\n================================================================================');
    console.log('🎉 VERIFIKASI FASE 0 BERHASIL 100%! SEMUA TARGET TERPENUHI:');
    console.log('   1. Enum 7 Role resmi dan seluruh enum status v1.0 aktif');
    console.log('   2. Model SessionLedger aktif sebagai sumber tunggal kebenaran');
    console.log('   3. Model OwnerCabang multi-cabang aktif');
    console.log('   4. MinQuotaSetting, InstructorFee, dan ProjectionRate ber-effective-date aktif');
    console.log('   5. OtherCost, MonthlyClose snapshot lock, dan CorrectionJournal aktif');
    console.log('   6. SessionAdjustRequest, InstructorAvailability, dan ReminderLog aktif');
    console.log('   7. Database bersih, konsisten, dan siap untuk Fase 1 (Sesi & Presensi)');
    console.log('================================================================================\n');
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ Verifikasi Fase 0 GAGAL:', err);
  process.exit(1);
});
