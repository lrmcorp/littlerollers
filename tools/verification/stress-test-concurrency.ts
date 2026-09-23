import {
  PrismaClient,
  Role,
  ClassSlotStatus,
  CheckInMethod,
  SessionMutationType,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';
import { AttendanceService } from '../../apps/api/src/attendance/kehadiran.service';
import { ClassSlotService } from '../../apps/api/src/classes/slot-kelas.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import { WhatsAppGatewayService } from '../../apps/api/src/notifications/whatsapp-gateway.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - BENCHMARK STRESS & CONCURRENCY TESTING (13 ATURAN BISNIS)   ║');
  console.log('║   (Race Conditions, Overbooking Guard, Idempotency Hammering & Locks)        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const idempotency = new IdempotencyService(db as any);
  const policy = new PolicyService();
  const runtimeConfig = {
    value: {
      booking: { enabled: true, cutoffHours: 2 },
      bookingCancellation: { enabled: true, cutoffHours: 24 },
      reschedule: { enabled: true, cutoffHours: 24 },
    },
  } as any;

  const bookingsService = new BookingsService(db as any, idempotency, policy, runtimeConfig);
  const attendanceService = new AttendanceService(db as any, policy, idempotency);
  const classSlotService = new ClassSlotService(db as any, runtimeConfig, idempotency, policy);
  const whatsappGateway = new WhatsAppGatewayService(db as any);

  try {
    console.log('▶ 1. Menyiapkan Aktor & Master Data untuk Uji Stres Konkurensi...');
    const branch = await db.cabang.findFirstOrThrow();
    const studio = await db.studio.findFirstOrThrow({ where: { branchId: branch.id } });
    const classType = await db.jenisKelas.findFirstOrThrow();
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });

    const adminPrincipal: SessionPrincipal = {
      sessionId: 'sess-admin-stress',
      userId: admin.id,
      roles: [{ role: 'ADMIN', branchId: branch.id }],
      capabilities: ['booking:manage', 'attendance:manage', 'class:manage', 'branch:all'],
      branchIds: [branch.id],
    };

    // Buat 5 User Customer Uji Coba Konkurensi
    const testPackage = await db.paket.create({
      data: {
        code: `PKG-STRESS-${Date.now()}`,
        name: 'Paket Stress Test Kuota',
        sessionCount: 10,
        validityDays: 30,
        priceRp: 1500000,
        branchId: branch.id,
        classTypeId: classType.id,
      },
    });

    const customers: { user: any; pkg: any; principal: SessionPrincipal }[] = [];
    for (let i = 1; i <= 5; i++) {
      const email = `stress.cust${i}.${Date.now()}@dailydose.test`;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const user = await db.user.create({
        data: {
          email,
          displayName: `Stress Customer ${i}`,
          phone: `+62819${Date.now().toString().slice(-5)}${randomSuffix}${i}`,
          role: Role.CUSTOMER,
        },
      });
      const validUntil = new Date(Date.now() + 30 * 86400000);
      const pkg = await db.paketPelanggan.create({
        data: {
          userId: user.id,
          packageId: testPackage.id,
          totalSessions: 10,
          remainingSessions: 10,
          usedSessions: 0,
          validUntil,
          status: 'ACTIVE',
        },
      });
      const principal: SessionPrincipal = {
        sessionId: `sess-stress-${i}`,
        userId: user.id,
        roles: [{ role: 'CUSTOMER', branchId: null }],
        capabilities: ['booking:self:create', 'booking:self:read'],
        branchIds: [],
      };
      customers.push({ user, pkg, principal });
    }
    console.log(`   ✅ Dibuat 5 Aktor Pelanggan & Paket Aktif untuk Uji Beban Paralel.`);

    // ------------------------------------------------------------------------
    // SKENARIO 1: UJI REBUTAN KURSI TERAKHIR (RACE CONDITION OVERBOOKING GUARD)
    // ------------------------------------------------------------------------
    console.log('\n▶ 2. SKENARIO 1: Uji Perebutan 1 Kursi Terakhir oleh 5 User Serentak (Race Condition)...');

    const now = new Date();
    const startAt = new Date(now.getTime() + 6 * 3600000);
    const endAt = new Date(startAt.getTime() + 3600000);

    const singleSeatSlot = await db.slotKelas.create({
      data: {
        branchId: branch.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt,
        endAt,
        capacity: 1, // HANYA 1 KURSI!
        bookedCount: 0,
        status: ClassSlotStatus.CONFIRMED,
      },
    });

    console.log(`   🎯 Slot Kelas Dibuat: ID=${singleSeatSlot.id}, Kapasitas=1 Kursi.`);
    console.log(`   ⚡ Menembakkan 5 request booking secara paralel bersamaan (Promise.all)...`);

    const tStart = Date.now();
    const bookingPromises = customers.map((c, idx) =>
      bookingsService
        .create(
          c.principal,
          {
            classSlotId: singleSeatSlot.id,
            customerPackageId: c.pkg.id,
            source: 'SELF',
          },
          `key-stress-book-${idx}-${Date.now()}`,
          `corr-stress-book-${idx}`,
        )
        .then((res) => ({ success: true, user: c.user.displayName, res }))
        .catch((err) => ({ success: false, user: c.user.displayName, error: err })),
    );

    const bookingResults = await Promise.all(bookingPromises);
    const durationMs = Date.now() - tStart;

    const successfulBookings = bookingResults.filter((r) => r.success);
    const rejectedBookings = bookingResults.filter((r) => !r.success);

    console.log(`   ⏱️  Waktu Eksekusi 5 Request Paralel: ${durationMs} ms`);
    console.log(`   📊 Hasil: Berhasil = ${successfulBookings.length}, Ditolak = ${rejectedBookings.length}`);

    // Validasi Integritas
    if (successfulBookings.length !== 1) {
      throw new Error(
        `CRITICAL RACE CONDITION FAULT: Seharusnya hanya 1 user yang berhasil, tetapi ${successfulBookings.length} user berhasil! (Overbooking terjadi!)`,
      );
    }

    const slotAfterRace = await db.slotKelas.findUniqueOrThrow({
      where: { id: singleSeatSlot.id },
    });
    if (slotAfterRace.bookedCount !== 1) {
      throw new Error(
        `CRITICAL DB INTEGRITY FAULT: bookedCount seharusnya persis 1, ditemukan: ${slotAfterRace.bookedCount}`,
      );
    }

    const actualBookingsCount = await db.pemesananKelas.count({
      where: { classSlotId: singleSeatSlot.id, status: 'BOOKED' },
    });
    if (actualBookingsCount !== 1) {
      throw new Error(`CRITICAL FAULT: Ditemukan ${actualBookingsCount} booking fisik di database!`);
    }

    console.log(`   ✅ Skenario 1 LULUS 100%:`);
    console.log(`      - Pemenang Kursi: ${successfulBookings[0].user}`);
    console.log(`      - 4 Peserta Lainnya Ditolak dengan Elegan (Kapasitas Penuh)`);
    console.log(`      - bookedCount database = ${slotAfterRace.bookedCount} (Nol Overbooking)`);

    // ------------------------------------------------------------------------
    // SKENARIO 2: HAMMERING IDEMPOTENSI CHECK-IN LINK MANDIRI (ATURAN #1)
    // ------------------------------------------------------------------------
    console.log('\n▶ 3. SKENARIO 2: Hammering 20 Request Paralel Check-In Link dalam Waktu Bersamaan...');

    const winningBooking = (successfulBookings[0] as any).res.body;
    const tokenIssue = await attendanceService.issue(
      adminPrincipal,
      winningBooking.id,
      {},
      `key-token-stress-${Date.now()}`,
      'corr-token-stress',
    );

    console.log(`   🎯 Token Check-In Diterbitkan: ${tokenIssue.token}`);
    console.log(`   ⚡ Menembakkan 20 request konfirmasi presensi secara serentak...`);

    const hammerPromises = Array.from({ length: 20 }, (_, idx) =>
      attendanceService
        .confirmCustomerLink(tokenIssue.token, startAt)
        .then((res) => ({ success: true, idx, res }))
        .catch((err) => ({ success: false, idx, error: err })),
    );

    const hammerResults = await Promise.all(hammerPromises);

    const attendedCount = hammerResults.filter(
      (r) => r.success && (r.res as any).status === 'ATTENDED',
    ).length;
    const alreadyAttendedCount = hammerResults.filter(
      (r) => r.success && (r.res as any).status === 'ALREADY_ATTENDED',
    ).length;

    console.log(`   📊 Hasil Hammering 20 Request:`);
    console.log(`      - Respons ATTENDED (Pertama Masuk)      : ${attendedCount}`);
    console.log(`      - Respons ALREADY_ATTENDED (Idempoten) : ${alreadyAttendedCount}`);

    if (attendedCount !== 1) {
      throw new Error(
        `CRITICAL IDEMPOTENCY FAULT: ATTENDED harus tepat 1, ditemukan: ${attendedCount}`,
      );
    }
    if (alreadyAttendedCount !== 19) {
      throw new Error(
        `CRITICAL IDEMPOTENCY FAULT: ALREADY_ATTENDED harus 19, ditemukan: ${alreadyAttendedCount}`,
      );
    }

    const attendanceRecords = await db.kehadiranPelanggan.count({
      where: { bookingId: winningBooking.id },
    });
    if (attendanceRecords !== 1) {
      throw new Error(
        `CRITICAL DB INTEGRITY FAULT: Baris kehadiran di DB seharusnya persis 1, ditemukan: ${attendanceRecords}`,
      );
    }

    console.log(`   ✅ Skenario 2 LULUS 100%:`);
    console.log(`      - Tepat 1 mutasi presensi berhasil dicatat`);
    console.log(`      - 19 request paralel lainnya ditangani secara idempoten tanpa duplikasi database`);

    // ------------------------------------------------------------------------
    // SKENARIO 3: UJI STRES PENYELESAIAN KELAS & PEMOTONGAN SESI (ATURAN #1)
    // ------------------------------------------------------------------------
    console.log('\n▶ 4. SKENARIO 3: Uji Concurrency Pemicu Selesai Kelas (Double Complete Prevention)...');

    // Menembakkan 5 request trigger complete() secara paralel untuk slot yang sama
    const completePromises = Array.from({ length: 5 }, (_, idx) =>
      classSlotService
        .complete(
          adminPrincipal,
          singleSeatSlot.id,
          { reason: 'Stress test double-completion' },
          `key-comp-stress-${idx}-${Date.now()}`,
          `corr-comp-${idx}`,
        )
        .then((res) => ({ success: true, idx, res }))
        .catch((err) => ({ success: false, idx, error: err })),
    );

    const completeResults = await Promise.all(completePromises);
    const completeSuccess = completeResults.filter((r) => r.success).length;

    console.log(`   📊 Hasil 5 Request Complete Paralel:`);
    console.log(`      - Berhasil Eksekusi Utama: ${completeSuccess}`);

    // Periksa SessionLedger: Sesi harus terpotong TEPAT 1 KALI (-1 sesi)
    const ledgerMutations = await db.sessionLedger.findMany({
      where: { referenceId: winningBooking.id, type: SessionMutationType.ATTEND },
    });

    if (ledgerMutations.length !== 1) {
      throw new Error(
        `CRITICAL MUTATION FAULT: Mutasi ATTEND di SessionLedger seharusnya persis 1, ditemukan: ${ledgerMutations.length}`,
      );
    }
    if (ledgerMutations[0].amount !== -1) {
      throw new Error(`CRITICAL MUTATION FAULT: Amount seharusnya -1, ditemukan: ${ledgerMutations[0].amount}`);
    }

    console.log(`   ✅ Skenario 3 LULUS 100%:`);
    console.log(`      - SessionLedger mencatat mutasi ATTEND sejumlah -1 tepat 1 kali`);
    console.log(`      - Tidak ada double-cut session akibat request completion bersamaan`);

    // ------------------------------------------------------------------------
    // SKENARIO 4: UJI HAMMERING IDEMPOTENSI NOTIFIKASI WHATSAPP GATEWAY
    // ------------------------------------------------------------------------
    console.log('\n▶ 5. SKENARIO 4: Uji Hammering 25 Pengiriman Notifikasi WhatsApp Serentak...');

    const targetPhone = `+62819999${Math.floor(1000 + Math.random() * 9000)}`;
    const dedupKey = `STRESS_TEST_BURST_${Date.now()}`;

    const waBurstPromises = Array.from({ length: 25 }, () =>
      whatsappGateway.sendMessage({
        to: targetPhone,
        recipientType: 'CUSTOMER',
        reminderType: 'REMINDER_BURST',
        text: 'Pesan uji coba konkurensi WhatsApp Gateway.',
      }),
    );

    const waResults = await Promise.all(waBurstPromises);
    const waSent = waResults.filter((r) => r.status === 'SENT').length;
    const waDeduped = waResults.filter((r) => r.status === 'SKIPPED_DUPLICATE').length;

    console.log(`   📊 Hasil Hammering 25 Pesan WhatsApp:`);
    console.log(`      - Status SENT (Pesan Pertama)        : ${waSent}`);
    console.log(`      - Status SKIPPED_DUPLICATE (Cegah Spam) : ${waDeduped}`);

    if (waSent !== 1 || waDeduped !== 24) {
      throw new Error(
        `CRITICAL WHATSAPP DEDUP FAULT: Seharusnya SENT=1 dan SKIPPED_DUPLICATE=24, ditemukan SENT=${waSent}, DEDUP=${waDeduped}`,
      );
    }

    console.log(`   ✅ Skenario 4 LULUS 100%:`);
    console.log(`      - 24 pesan spam duplikat berhasil dicegah 100% oleh Idempotency Guard`);

    // ------------------------------------------------------------------------
    // CLEANUP DATA UJI COBA
    // ------------------------------------------------------------------------
    console.log('\n▶ 6. Membersihkan Data Uji Beban & Konkurensi...');
    await db.sessionLedger.deleteMany({ where: { referenceId: winningBooking.id } });
    await db.kehadiranPelanggan.deleteMany({ where: { bookingId: winningBooking.id } });
    await db.checkInToken.deleteMany({ where: { bookingId: winningBooking.id } });
    await db.pemesananKelas.deleteMany({ where: { classSlotId: singleSeatSlot.id } });
    await db.slotKelas.delete({ where: { id: singleSeatSlot.id } });
    for (const c of customers) {
      await db.paketPelanggan.deleteMany({ where: { userId: c.user.id } });
      await db.user.delete({ where: { id: c.user.id } });
    }
    await db.paket.delete({ where: { id: testPackage.id } });
    await db.reminderLog.deleteMany({ where: { recipientPhone: targetPhone } });
    console.log('   ✅ Data uji coba konkurensi dibersihkan.');

    console.log('\n================================================================================');
    console.log('🎉 SELURUH BENCHMARK STRESS & CONCURRENCY TESTING LULUS 100%! 🎉');
    console.log('   1. Race Condition Overbooking: 5 user merebut 1 kursi -> Tepat 1 lolos, 4 gagal');
    console.log('   2. Idempotency Hammering: 20 konfirmasi check-in paralel -> 1 ATTENDED, 19 ALREADY');
    console.log('   3. Class Completion Concurrency: Double trigger -> Tepat 1 mutasi ATTEND (-1)');
    console.log('   4. WhatsApp Gateway Burst: 25 notifikasi serentak -> 1 SENT, 24 DEDUPLICATED');
    console.log('================================================================================\n');
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ STRESS TEST GAGAL:', err);
  process.exit(1);
});
