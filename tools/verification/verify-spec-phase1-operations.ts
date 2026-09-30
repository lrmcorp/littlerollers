import {
  PrismaClient,
  Role,
  SessionMutationType,
  AdjustRequestStatus,
  ClassSlotStatus,
  CheckInMethod,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';
import { AttendanceService } from '../../apps/api/src/attendance/kehadiran.service';
import { ClassSlotService } from '../../apps/api/src/classes/slot-kelas.service';
import { LedgerService } from '../../apps/api/src/packages/ledger.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import { AuditService } from '../../apps/api/src/foundation/audit.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - VERIFIKASI FASE 1: OPERASIONAL SESI, BOOKING & PRESENSI     ║');
  console.log('║   (Rules #1, #2, #6, #9: Ledger Mutasi, Link Check-in, H+2 Cutoff, Adjust)   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();

  const idempotency = new IdempotencyService(db as any);
  const policy = new PolicyService();
  const audit = new AuditService();
  const runtimeConfig = {
    value: {
      booking: { enabled: true, cutoffHours: 2 },
      bookingCancellation: { enabled: true, cutoffHours: 24 },
      reschedule: { enabled: true, cutoffHours: 24 },
    },
  } as any;

  const bookingsService = new BookingsService(db as any, idempotency, policy, runtimeConfig);
  const attendanceService = new AttendanceService(db as any, policy, idempotency);
  const classSlotService = new ClassSlotService(
    db as any,
    policy,
    idempotency,
    runtimeConfig,
  );
  const ledgerService = new LedgerService(db as any, policy, audit);

  try {
    // ------------------------------------------------------------------------
    // Persiapan Akun & Master Data Uji
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor Uji (Customer, Admin, Manager, Cabang, Kelas)...');

    const customerUser = await db.user.findFirstOrThrow({
      where: { role: Role.CUSTOMER },
    });
    const adminUser = await db.user.findFirstOrThrow({
      where: { role: Role.ADMIN },
    });
    const managerUser = await db.user.findFirstOrThrow({
      where: { role: Role.MANAGER },
    });
    const branch = await db.cabang.findFirstOrThrow();
    const classType = await db.jenisKelas.findFirstOrThrow();
    const studio = await db.studio.findFirstOrThrow({ where: { branchId: branch.id } });
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });

    console.log(`   ✅ Customer: ${customerUser.displayName} (${customerUser.id})`);
    console.log(`   ✅ Admin: ${adminUser.displayName} (${adminUser.id})`);
    console.log(`   ✅ Manager: ${managerUser.displayName} (${managerUser.id})`);
    console.log(`   ✅ Cabang: ${branch.name} (${branch.code}), Studio: ${studio.name}`);

    // Principals
    const customerPrincipal: SessionPrincipal = {
      sessionId: 'sess-cust-phase1',
      userId: customerUser.id,
      roles: [{ role: 'CUSTOMER', branchId: null }],
      capabilities: ['booking:self:create', 'booking:self:read', 'booking:self:cancel'],
      branchIds: [],
    };

    const adminPrincipal: SessionPrincipal = {
      sessionId: 'sess-admin-phase1',
      userId: adminUser.id,
      roles: [{ role: 'ADMIN', branchId: branch.id }],
      capabilities: [
        'booking:read',
        'booking:manage',
        'attendance:read',
        'attendance:manage',
        'class-slot:manage',
        'ledger:adjust:request',
        'ledger:adjust:read',
        'ledger:read',
        'branch:all',
      ],
      branchIds: [branch.id],
    };

    const managerPrincipal: SessionPrincipal = {
      sessionId: 'sess-mgr-phase1',
      userId: managerUser.id,
      roles: [{ role: 'MANAGER', branchId: branch.id }],
      capabilities: [
        'booking:manage',
        'attendance:manage',
        'class-slot:manage',
        'ledger:adjust:decide',
        'ledger:adjust:request',
        'ledger:adjust:read',
        'ledger:read',
        'branch:all',
      ],
      branchIds: [branch.id],
    };

    // Buat Paket Pelanggan Uji dengan 10 sesi
    const testPackage = await db.paket.create({
      data: {
        code: `PKG-TEST-${Date.now()}`,
        name: 'Paket Uji Operasional Fase 1',
        sessionCount: 10,
        validityDays: 30,
        priceRp: 1500000,
        branchId: branch.id,
        classTypeId: classType.id,
      },
    });

    const validUntil = new Date(Date.now() + 30 * 86400000);
    const customerPackage = await db.paketPelanggan.create({
      data: {
        userId: customerUser.id,
        packageId: testPackage.id,
        totalSessions: 10,
        remainingSessions: 10,
        usedSessions: 0,
        validUntil,
        status: 'ACTIVE',
      },
    });

    console.log(`   ✅ Paket Pelanggan Uji Dibuat: ID=${customerPackage.id}, Kuota=10 sesi.`);

    // ------------------------------------------------------------------------
    // PENGUJIAN 1: Booking Tanpa Pemotongan Sesi Langsung (Rule #1 & #2)
    // ------------------------------------------------------------------------
    console.log('\n▶ 2. Menguji Booking Kelas: Sesi TIDAK Dipotong Saat Booking (Rule #1 & #2)...');

    const now = new Date();
    const slotStart1 = new Date(now.getTime() + 4 * 3600000); // 4 jam ke depan
    const slotEnd1 = new Date(slotStart1.getTime() + 3600000);

    const testSlot1 = await db.slotKelas.create({
      data: {
        branchId: branch.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: slotStart1,
        endAt: slotEnd1,
        capacity: 5,
        bookedCount: 0,
        status: 'CONFIRMED',
      },
    });

    // Customer melakukan booking
    const bookingRes1 = (await bookingsService.create(
      customerPrincipal,
      {
        classSlotId: testSlot1.id,
        customerPackageId: customerPackage.id,
        source: 'SELF',
      },
      `key-book-1-${Date.now()}`,
      'corr-1',
    )) as any;

    const bookingId1 = bookingRes1.body.id;
    console.log(`   ✅ Booking berhasil dibuat: ID=${bookingId1}, BookingNumber=${bookingRes1.body.bookingNumber}`);

    // Periksa status paket pelanggan di database
    const pkgAfterBooking = await db.paketPelanggan.findUniqueOrThrow({
      where: { id: customerPackage.id },
    });

    if (pkgAfterBooking.remainingSessions !== 10) {
      throw new Error(
        `Pelanggaran Rule #1: remainingSessions seharusnya tetap 10 saat booking, tapi bernilai ${pkgAfterBooking.remainingSessions}!`,
      );
    }
    console.log(`   ✅ Verifikasi Berhasil: Kuota fisik paket tetap ${pkgAfterBooking.remainingSessions} sesi (belum terpotong).`);

    // Periksa bahwa belum ada mutasi SessionLedger
    const ledgerCountBefore = await db.sessionLedger.count({
      where: { referenceId: bookingId1 },
    });
    if (ledgerCountBefore !== 0) {
      throw new Error(`Ditemukan ${ledgerCountBefore} mutasi ledger saat booking, seharusnya 0!`);
    }
    console.log(`   ✅ Verifikasi Berhasil: Tidak ada catatan SessionLedger prematur saat booking.`);

    // ------------------------------------------------------------------------
    // PENGUJIAN 2: Presensi Customer via Web Link & Token (Rule #1)
    // ------------------------------------------------------------------------
    console.log('\n▶ 3. Menguji Presensi Customer Mandiri via Web Link (Rule #1)...');

    // Terbitkan token check-in
    const tokenIssue = await attendanceService.issue(
      adminPrincipal,
      bookingId1,
      {},
      `key-token-1-${Date.now()}`,
      'corr-token-1',
    );
    console.log(`   ✅ Token check-in diterbitkan: token=${tokenIssue.token}`);
    console.log(`   ✅ Check-in Link: ${tokenIssue.checkInLink}`);

    // Dapatkan info link check-in
    const linkInfo = await attendanceService.getCustomerLinkInfo(tokenIssue.token, slotStart1);
    console.log(`   ✅ Info link berhasil dibaca: Kelas="${linkInfo.className}", Status=${linkInfo.status}, CanConfirm=${linkInfo.canConfirm}`);

    // Konfirmasi kehadiran via link
    const confirmRes = await attendanceService.confirmCustomerLink(tokenIssue.token, slotStart1);
    if (!confirmRes.ok || confirmRes.status !== 'ATTENDED') {
      throw new Error(`Konfirmasi check-in link gagal: ${JSON.stringify(confirmRes)}`);
    }
    console.log(`   ✅ Presensi link terkonfirmasi: status=${confirmRes.status}, Pesan="${confirmRes.message}"`);

    // Uji sifat idempoten (klik kedua kali)
    const confirmRes2 = await attendanceService.confirmCustomerLink(tokenIssue.token, slotStart1);
    if (confirmRes2.status !== 'ALREADY_ATTENDED') {
      throw new Error(`Idempotent check gagal: status=${confirmRes2.status}`);
    }
    console.log(`   ✅ Idempotensi terverifikasi: pemanggilan ulang mengembalikan status ALREADY_ATTENDED.`);

    // Periksa metode kehadiran di database
    const attRecord = await db.kehadiranPelanggan.findUniqueOrThrow({
      where: { bookingId: bookingId1 },
    });
    if (attRecord.method !== CheckInMethod.WEB_LINK) {
      throw new Error(`Metode kehadiran seharusnya WEB_LINK, ditemukan ${attRecord.method}!`);
    }
    console.log(`   ✅ Verifikasi Database: Metode kehadiran dicatat sebagai WEB_LINK.`);

    // ------------------------------------------------------------------------
    // PENGUJIAN 3: Penyelesaian Kelas & Pemotongan Sesi (Rule #1)
    // ------------------------------------------------------------------------
    console.log('\n▶ 4. Menguji Penyelesaian Kelas (COMPLETED) & Pemotongan Sesi via SessionLedger (Rule #1)...');

    await classSlotService.complete(
      adminPrincipal,
      testSlot1.id,
      { reason: 'Kelas selesai dengan sukses' },
      `key-complete-1-${Date.now()}`,
      'corr-comp-1',
    );

    // Periksa paket pelanggan pasca-completed
    const pkgAfterComplete = await db.paketPelanggan.findUniqueOrThrow({
      where: { id: customerPackage.id },
    });
    if (pkgAfterComplete.remainingSessions !== 9 || pkgAfterComplete.usedSessions !== 1) {
      throw new Error(
        `Pelanggaran Rule #1: Pasca-COMPLETED, remainingSessions harusnya 9 (used=1), tetapi remaining=${pkgAfterComplete.remainingSessions}, used=${pkgAfterComplete.usedSessions}`,
      );
    }
    console.log(`   ✅ Kuota paket pelanggan berhasil dipotong: Sisa Sesi = ${pkgAfterComplete.remainingSessions}, Terpakai = ${pkgAfterComplete.usedSessions}`);

    // Periksa mutasi SessionLedger
    const attendLedger = await db.sessionLedger.findFirst({
      where: {
        customerPackageId: customerPackage.id,
        referenceId: bookingId1,
        type: SessionMutationType.ATTEND,
      },
    });
    if (!attendLedger || attendLedger.amount !== -1 || attendLedger.balanceAfter !== 9) {
      throw new Error(`Mutasi SessionLedger bertipe ATTEND (-1) tidak valid: ${JSON.stringify(attendLedger)}`);
    }
    console.log(`   ✅ SessionLedger resmi tercatat: Type=${attendLedger.type}, Amount=${attendLedger.amount}, BalanceAfter=${attendLedger.balanceAfter}`);
    console.log(`      Catatan: "${attendLedger.notes}"`);

    // ------------------------------------------------------------------------
    // PENGUJIAN 4: Toleransi Window Backfill Admin H+2 Jam (Rule #9)
    // ------------------------------------------------------------------------
    console.log('\n▶ 5. Menguji Batas Toleransi Backfill Admin H+2 Jam (Rule #9)...');

    // Kasus A: Dalam Window (H+0.5 jam setelah kelas selesai) -> HARUS BERHASIL
    const slotStartA = new Date(now.getTime() - 2 * 3600000); // Mulai 2 jam lalu
    const slotEndA = new Date(now.getTime() - 30 * 60000);   // Selesai 30 menit lalu (H+0.5)

    const slotA = await db.slotKelas.create({
      data: {
        branchId: branch.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: slotStartA,
        endAt: slotEndA,
        capacity: 5,
        bookedCount: 1,
        status: 'CONFIRMED',
      },
    });

    const bookingA = await db.pemesananKelas.create({
      data: {
        bookingNumber: `BK-TEST-A-${Date.now()}`,
        classSlotId: slotA.id,
        userId: customerUser.id,
        customerPackageId: customerPackage.id,
        status: 'BOOKED',
      },
    });

    const backfillResA = await attendanceService.backfillCustomer(
      adminPrincipal,
      {
        bookingId: bookingA.id,
        reason: 'Customer hadir di studio tapi smartphone lowbat',
      },
      `key-backfill-a-${Date.now()}`,
      'corr-bf-a',
      now, // Saat ini = H+0.5 jam (masih dalam window H+2)
    );

    if (backfillResA.status !== 201) {
      throw new Error(`Backfill dalam toleransi H+2 jam gagal!`);
    }
    console.log(`   ✅ Backfill dalam jendela H+2 (H+0.5 jam) BERHASIL: Status=${(backfillResA.body as any).status}`);

    // Kasus B: Di luar Window (H+3.0 jam setelah kelas selesai) -> HARUS DITOLAK (ADMIN_BACKFILL_WINDOW_CLOSED)
    const slotStartB = new Date(now.getTime() - 4 * 3600000); // Mulai 4 jam lalu
    const slotEndB = new Date(now.getTime() - 3 * 3600000);   // Selesai 3 jam lalu (H+3.0)

    const slotB = await db.slotKelas.create({
      data: {
        branchId: branch.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: slotStartB,
        endAt: slotEndB,
        capacity: 5,
        bookedCount: 1,
        status: 'CONFIRMED',
      },
    });

    const bookingB = await db.pemesananKelas.create({
      data: {
        bookingNumber: `BK-TEST-B-${Date.now()}`,
        classSlotId: slotB.id,
        userId: customerUser.id,
        customerPackageId: customerPackage.id,
        status: 'BOOKED',
      },
    });

    let backfillRejectedAsExpected = false;
    try {
      await attendanceService.backfillCustomer(
        adminPrincipal,
        {
          bookingId: bookingB.id,
          reason: 'Customer terlambat konfirmasi',
        },
        `key-backfill-b-${Date.now()}`,
        'corr-bf-b',
        now, // Saat ini = H+3.0 jam (melewati batas toleransi H+2)
      );
    } catch (err: any) {
      if (err.code === 'ADMIN_BACKFILL_WINDOW_CLOSED') {
        backfillRejectedAsExpected = true;
        console.log(`   ✅ Backfill di luar jendela H+2 (H+3.0 jam) DITOLAK SEBAGAIMANA MESTINYA: Code=${err.code}`);
      } else {
        throw err;
      }
    }

    if (!backfillRejectedAsExpected) {
      throw new Error('Pelanggaran Rule #9: Backfill di luar jendela H+2 jam seharusnya ditolak!');
    }

    // ------------------------------------------------------------------------
    // PENGUJIAN 5: Alur SessionAdjustRequest untuk Kasus < H-24 Jam (Rule #6)
    // ------------------------------------------------------------------------
    console.log('\n▶ 6. Menguji Permohonan SessionAdjustRequest & Approval Manager (Rule #6)...');

    // Admin mengajukan penyesuaian sesi karena kendala darurat
    const adjustReqRes = await ledgerService.requestAdjustment(
      adminPrincipal,
      {
        customerPackageId: customerPackage.id,
        quantity: 1,
        reasonCode: 'PACKAGE_COMPENSATION',
        note: 'Customer mengalami kecelakaan ringan mendadak (< H-24 jam) dengan bukti surat dokter',
      },
      `key-adj-p1-${Date.now()}`,
      'corr-adj-p1',
    );

    const adjustRequestId = adjustReqRes.id;
    console.log(`   ✅ Admin berhasil mengajukan SessionAdjustRequest: ID=${adjustRequestId}, Status=${adjustReqRes.status}`);

    // Manager melihat antrean request
    const pendingList = await ledgerService.listAdjustments(managerPrincipal, {
      status: 'PENDING',
    });
    const foundPending = pendingList.items.some((i: any) => i.id === adjustRequestId);
    if (!foundPending) {
      throw new Error(`Permohonan ${adjustRequestId} tidak ditemukan pada antrean pending Manager!`);
    }
    console.log(`   ✅ Manager berhasil melihat permohonan dalam antrean (Total pending: ${pendingList.items.length}).`);

    // Manager menyetujui permohonan
    const pkgBeforeAdjust = await db.paketPelanggan.findUniqueOrThrow({
      where: { id: customerPackage.id },
    });
    const initialRemaining = pkgBeforeAdjust.remainingSessions;

    const decisionRes = await ledgerService.decideAdjustment(
      managerPrincipal,
      adjustRequestId,
      'approve',
      {
        reasonCode: 'CORRECTION_VERIFIED',
        note: 'Bukti surat dokter valid, disetujui untuk kompensasi 1 sesi.',
        expectedVersion: adjustReqRes.version,
      },
      `key-dec-p1-${Date.now()}`,
      'corr-dec-p1',
    );

    if (decisionRes.adjustment.status !== 'POSTED') {
      throw new Error(`Persetujuan Manager gagal, status=${decisionRes.adjustment.status}`);
    }
    console.log(`   ✅ Manager menyetujui permohonan: Status=${decisionRes.adjustment.status}`);

    // Verifikasi saldo di PaketPelanggan bertambah 1
    const pkgAfterAdjust = await db.paketPelanggan.findUniqueOrThrow({
      where: { id: customerPackage.id },
    });
    if (pkgAfterAdjust.remainingSessions !== initialRemaining + 1) {
      throw new Error(
        `Saldo sisa sesi gagal dipulihkan: sebelum=${initialRemaining}, sesudah=${pkgAfterAdjust.remainingSessions}`,
      );
    }
    console.log(`   ✅ Kuota sesi berhasil dipulihkan: ${initialRemaining} -> ${pkgAfterAdjust.remainingSessions}`);

    // Verifikasi mutasi SessionLedger bertipe ADJUST_MANUAL (+1)
    const adjustLedger = await db.sessionLedger.findFirst({
      where: {
        customerPackageId: customerPackage.id,
        referenceId: adjustRequestId,
        type: SessionMutationType.ADJUST_MANUAL,
      },
    });
    if (!adjustLedger || adjustLedger.amount !== 1) {
      throw new Error(`Mutasi SessionLedger ADJUST_MANUAL (+1) tidak ditemukan: ${JSON.stringify(adjustLedger)}`);
    }
    console.log(`   ✅ SessionLedger resmi tercatat: Type=${adjustLedger.type}, Amount=+${adjustLedger.amount}, BalanceAfter=${adjustLedger.balanceAfter}`);
    console.log(`      Catatan: "${adjustLedger.notes}"`);

    // 6b. Menguji Direct Adjustment 1-Klik Manager Cabang (Tanpa Birokrasi)
    console.log('\n▶ 6b. Menguji Direct Adjustment 1-Klik Manager Cabang (Tanpa Birokrasi)...');
    const directRes = await ledgerService.directAdjustment(
      managerPrincipal,
      {
        customerPackageId: customerPackage.id,
        quantity: 1,
        reasonCode: 'PACKAGE_COMPENSATION',
        note: 'Direct 1-klik kompensasi instan oleh Manager',
      },
      `key-direct-p1-${Date.now()}`,
      'corr-direct-p1',
    );
    const directStatus = directRes.adjustment?.status ?? (directRes as any).status;
    const directId = directRes.adjustment?.id ?? (directRes as any).id;
    if (directStatus !== 'POSTED') {
      throw new Error(`Direct adjustment Manager gagal, status=${directStatus}`);
    }
    console.log(`   ✅ Direct Adjustment Manager SUKSES: ID=${directId}, Status=${directStatus}, Saldo Akhir=${directRes.resultingBalance}`);

    // ------------------------------------------------------------------------
    // Pembersihan Data Uji Coba
    // ------------------------------------------------------------------------
    console.log('\n▶ 7. Membersihkan Data Uji Coba (Cleanup)...');
    await db.sessionLedger.deleteMany({ where: { customerPackageId: customerPackage.id } });
    await db.sessionAdjustRequest.deleteMany({ where: { customerPackageId: customerPackage.id } });
    await db.kehadiranPelanggan.deleteMany({
      where: { bookingId: { in: [bookingId1, bookingA.id, bookingB.id] } },
    });
    await db.checkInToken.deleteMany({
      where: { bookingId: { in: [bookingId1, bookingA.id, bookingB.id] } },
    });
    await db.pemesananKelas.deleteMany({
      where: { id: { in: [bookingId1, bookingA.id, bookingB.id] } },
    });
    await db.slotKelas.deleteMany({
      where: { id: { in: [testSlot1.id, slotA.id, slotB.id] } },
    });
    await db.paketPelanggan.delete({ where: { id: customerPackage.id } });
    await db.paket.delete({ where: { id: testPackage.id } });
    console.log('   ✅ Data uji coba berhasil dibersihkan tanpa residu.');

    console.log('\n================================================================================');
    console.log('🎉 SELURUH PENGUJIAN FASE 1 BERHASIL 100%! TARGET TERPENUHI:');
    console.log('   1. Rule #1 & #2: Sesi TIDAK dipotong saat booking dibuat');
    console.log('   2. Rule #1: Customer check-in via web link berhasil & idempotent');
    console.log('   3. Rule #1: Sesi dipotong otomatis via SessionLedger (ATTEND, -1) saat COMPLETED');
    console.log('   4. Rule #9: Toleransi backfill Admin ditegakkan ketat maksimal H+2 jam');
    console.log('   5. Rule #6: Reschedule < H-24 diakomodasi resmi via alur SessionAdjustRequest');
    console.log('   6. Ledger saldo sesi mutasi terjaga akurat sebagai Single Source of Truth');
    console.log('================================================================================\n');
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ Verifikasi Fase 1 GAGAL:', err);
  process.exit(1);
});
