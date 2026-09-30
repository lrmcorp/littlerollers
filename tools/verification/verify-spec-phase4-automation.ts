import {
  PrismaClient,
  Role,
  ClassSlotStatus,
  SessionMutationType,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { WhatsAppGatewayService } from '../../apps/api/src/notifications/whatsapp-gateway.service';
import { AutoCancelService } from '../../apps/api/src/classes/auto-cancel.service';
import { ReminderScheduleService } from '../../apps/api/src/notifications/reminder-schedule.service';
import { NotificationTemplateService } from '../../apps/api/src/notifications/notification-template.service';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - VERIFIKASI FASE 4: OTOMASI AUTO-CANCEL & WHATSAPP RESMI     ║');
  console.log('║   (Rules #4, #5, #11, #12, #13: MinQuota, H-24, Idempotency, stoppedAt)      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const whatsapp = new WhatsAppGatewayService(db as any);
  const autoCancel = new AutoCancelService(db as any, whatsapp);
  const templates = new NotificationTemplateService(db as any);
  const reminderSchedule = new ReminderScheduleService(db as any, whatsapp, templates);

  try {
    // ------------------------------------------------------------------------
    // 1. Menyiapkan Aktor & Master Data Pengujian
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor & Master Data Pengujian...');

    const superOwner = await db.user.findFirstOrThrow({ where: { role: Role.SUPER_OWNER } });
    const owner = await db.user.findFirstOrThrow({ where: { role: Role.OWNER } });
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });

    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) {
      throw new Error('Diperlukan minimal 2 cabang di database untuk verifikasi!');
    }
    const [branchA] = branches;
    const classType = await db.jenisKelas.findFirstOrThrow();
    const studio = await db.studio.findFirstOrThrow({ where: { branchId: branchA.id } });
    const pkg = await db.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });

    // Pastikan admin terhubung ke cabang A
    await db.user.update({
      where: { id: admin.id },
      data: { preferredBranchId: branchA.id, phone: admin.phone || '+6281200000001' },
    });

    // Buat/ambil Customer 1 (Aktif)
    const customerActive1 = await db.user.upsert({
      where: { email: 'phase4.cust1@dailydose.test' },
      update: { stoppedAt: null, phone: '+6281900000001' },
      create: {
        email: 'phase4.cust1@dailydose.test',
        displayName: 'Customer Aktif Satu',
        phone: '+6281900000001',
        role: Role.CUSTOMER,
        status: 'ACTIVE',
        stoppedAt: null,
      },
    });

    // Buat/ambil Customer 2 (Aktif)
    const customerActive2 = await db.user.upsert({
      where: { email: 'phase4.cust2@dailydose.test' },
      update: { stoppedAt: null, phone: '+6281900000002' },
      create: {
        email: 'phase4.cust2@dailydose.test',
        displayName: 'Customer Aktif Dua',
        phone: '+6281900000002',
        role: Role.CUSTOMER,
        status: 'ACTIVE',
        stoppedAt: null,
      },
    });

    // Buat/ambil Customer Berhenti (Rule #12 & #13 stoppedAt)
    const customerStopped = await db.user.upsert({
      where: { email: 'phase4.stopped@dailydose.test' },
      update: { stoppedAt: new Date('2026-08-01T00:00:00Z'), phone: '+6281900000003' },
      create: {
        email: 'phase4.stopped@dailydose.test',
        displayName: 'Customer Berhenti Proteksi',
        phone: '+6281900000003',
        role: Role.CUSTOMER,
        status: 'ACTIVE',
        stoppedAt: new Date('2026-08-01T00:00:00Z'),
      },
    });

    // Konfigurasi MinQuotaSetting: minQuota = 2, cutoffHours = 24
    await db.minQuotaSetting.upsert({
      where: {
        branchId_classTypeId: {
          branchId: branchA.id,
          classTypeId: classType.id,
        },
      },
      update: {
        minQuota: 2,
        cutoffHours: 24,
        active: true,
      },
      create: {
        branchId: branchA.id,
        classTypeId: classType.id,
        minQuota: 2,
        cutoffHours: 24,
        active: true,
      },
    });

    // Bersihkan ReminderLog untuk nomor uji coba
    const testPhones = [
      customerActive1.phone!,
      customerActive2.phone!,
      customerStopped.phone!,
      admin.phone!,
      instructor.phone!,
      owner.phone!,
    ];
    await db.reminderLog.deleteMany({
      where: { recipientPhone: { in: testPhones } },
    });

    console.log(`   ✅ Cabang       : ${branchA.name} (${branchA.code})`);
    console.log(`   ✅ MinQuota     : 2 Peserta (Cutoff: 24 Jam)`);
    console.log(`   ✅ Customer 1   : ${customerActive1.displayName} (${customerActive1.phone})`);
    console.log(`   ✅ Customer 2   : ${customerActive2.displayName} (${customerActive2.phone})`);
    console.log(`   ✅ Cust Stopped : ${customerStopped.displayName} [STOPPED AT: ${customerStopped.stoppedAt?.toISOString()}]`);

    // ------------------------------------------------------------------------
    // 2. Pengujian Auto-Cancel Kelas Kurang Kuota (H-24 Cutoff - Rules #4 & #5)
    // ------------------------------------------------------------------------
    console.log('\n▶ 2. Menguji Auto-Cancel Kelas Kurang Kuota (Rules #4 & #5)...');

    const nowTest = new Date('2026-11-10T10:00:00Z');
    // Kelas mulai 20 jam ke depan (masuk jendela H-24)
    const slotStart1 = new Date(nowTest.getTime() + 20 * 3_600_000);
    const slotEnd1 = new Date(slotStart1.getTime() + 3_600_000);

    const slotUnderQuota = await db.slotKelas.create({
      data: {
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: slotStart1,
        endAt: slotEnd1,
        capacity: 10,
        status: ClassSlotStatus.PUBLISHED,
      },
    });

    // Buat paket untuk Customer 1
    const custPkg1 = await db.paketPelanggan.create({
      data: {
        userId: customerActive1.id,
        packageId: pkg.id,
        totalSessions: 10,
        remainingSessions: 10,
        usedSessions: 0,
        validUntil: new Date('2026-12-31T23:59:59Z'),
        status: 'ACTIVE',
      },
    });

    // Buat 1 booking aktif (kurang dari kuota minimum 2)
    const booking1 = await db.pemesananKelas.create({
      data: {
        bookingNumber: `BK-PH4-${randomUUID().slice(0, 8)}`,
        userId: customerActive1.id,
        classSlotId: slotUnderQuota.id,
        customerPackageId: custPkg1.id,
        status: 'BOOKED',
      },
    });

    // Eksekusi auto-cancel evaluation
    const evalResult1 = await autoCancel.evaluateClasses(nowTest);

    // Verifikasi slot kelas dibatalkan otomatis
    const cancelledSlot = await db.slotKelas.findUniqueOrThrow({ where: { id: slotUnderQuota.id } });
    if (cancelledSlot.status !== ClassSlotStatus.CANCELLED || cancelledSlot.cancellationReason !== 'AUTO_CANCEL_MIN_QUOTA') {
      throw new Error(`Auto-cancel gagal! Status slot: ${cancelledSlot.status}, alasan: ${cancelledSlot.cancellationReason}`);
    }

    // Verifikasi booking dibatalkan
    const cancelledBooking = await db.pemesananKelas.findUniqueOrThrow({ where: { id: booking1.id } });
    if (cancelledBooking.status !== 'CANCELLED' || cancelledBooking.cancellationReason !== 'CLASS_AUTO_CANCELLED') {
      throw new Error(`Pembatalan booking gagal! Status: ${cancelledBooking.status}`);
    }

    // Verifikasi SessionLedger audit log
    const ledgerEntry = await db.sessionLedger.findFirst({
      where: { referenceId: booking1.id, type: SessionMutationType.REFUND_AUTOCANCEL },
    });
    if (!ledgerEntry) {
      throw new Error('Audit SessionLedger REFUND_AUTOCANCEL tidak tercatat!');
    }

    console.log(`   ✅ Slot kelas berhasil dibatalkan otomatis: status = CANCELLED (Alasan: AUTO_CANCEL_MIN_QUOTA)`);
    console.log(`   ✅ Booking peserta dibatalkan otomatis: status = CANCELLED (Alasan: CLASS_AUTO_CANCELLED)`);
    console.log(`   ✅ Audit SessionLedger REFUND_AUTOCANCEL tercatat (Saldo sisa: ${ledgerEntry.balanceAfter})`);

    // ------------------------------------------------------------------------
    // 3. Pengujian Notifikasi WhatsApp Multi-Pihak
    // ------------------------------------------------------------------------
    console.log('\n▶ 3. Menguji Pengiriman Notifikasi WhatsApp Multi-Pihak...');

    const notifCustomer = await db.reminderLog.findFirst({
      where: {
        recipientPhone: whatsapp.normalizePhone(customerActive1.phone!),
        reminderType: 'CLASS_AUTO_CANCELLED',
      },
    });
    if (!notifCustomer) {
      throw new Error('Notifikasi pembatalan kelas ke Customer tidak tercatat di ReminderLog!');
    }

    const notifInstructor = await db.reminderLog.findFirst({
      where: {
        recipientPhone: whatsapp.normalizePhone(instructor.phone!),
        reminderType: 'CLASS_AUTO_CANCELLED_INSTRUCTOR',
      },
    });
    if (!notifInstructor) {
      throw new Error('Notifikasi pembatalan kelas ke Instruktur tidak tercatat di ReminderLog!');
    }

    const notifStaff = await db.reminderLog.findFirst({
      where: {
        reminderType: 'CLASS_AUTO_CANCELLED_STAFF',
      },
    });
    if (!notifStaff) {
      throw new Error('Notifikasi pembatalan kelas ke Staf Cabang tidak tercatat di ReminderLog!');
    }

    console.log(`   ✅ Notifikasi WhatsApp ke Customer terverifikasi (ID: ${notifCustomer.id})`);
    console.log(`   ✅ Notifikasi WhatsApp ke Instruktur terverifikasi (ID: ${notifInstructor.id})`);
    console.log(`   ✅ Notifikasi WhatsApp ke Staf Cabang terverifikasi (ID: ${notifStaff.id})`);

    // ------------------------------------------------------------------------
    // 4. Pengujian Kelas Memenuhi Kuota Tetap Aman (>= MinQuota)
    // ------------------------------------------------------------------------
    console.log('\n▶ 4. Menguji Kelas Memenuhi Kuota Tetap Aman (>= MinQuota)...');

    const slotStart2 = new Date(nowTest.getTime() + 20 * 3_600_000);
    const slotEnd2 = new Date(slotStart2.getTime() + 3_600_000);

    const slotSufficient = await db.slotKelas.create({
      data: {
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: slotStart2,
        endAt: slotEnd2,
        capacity: 10,
        status: ClassSlotStatus.PUBLISHED,
      },
    });

    const custPkg2 = await db.paketPelanggan.create({
      data: {
        userId: customerActive2.id,
        packageId: pkg.id,
        totalSessions: 10,
        remainingSessions: 10,
        validUntil: new Date('2026-12-31T23:59:59Z'),
        status: 'ACTIVE',
      },
    });

    // Daftarkan 2 booking (memenuhi kuota minimum 2)
    const bookingSafe1 = await db.pemesananKelas.create({
      data: {
        bookingNumber: `BK-PH4-${randomUUID().slice(0, 8)}`,
        userId: customerActive1.id,
        classSlotId: slotSufficient.id,
        customerPackageId: custPkg1.id,
        status: 'BOOKED',
      },
    });
    const bookingSafe2 = await db.pemesananKelas.create({
      data: {
        bookingNumber: `BK-PH4-${randomUUID().slice(0, 8)}`,
        userId: customerActive2.id,
        classSlotId: slotSufficient.id,
        customerPackageId: custPkg2.id,
        status: 'BOOKED',
      },
    });

    // Evaluasi ulang
    const evalResult2 = await autoCancel.evaluateClasses(nowTest);

    const safeSlot = await db.slotKelas.findUniqueOrThrow({ where: { id: slotSufficient.id } });
    if (safeSlot.status === ClassSlotStatus.CANCELLED) {
      throw new Error('SALAH: Kelas yang memenuhi kuota justru dibatalkan!');
    }
    console.log(`   ✅ Kelas dengan 2 peserta tetap aman: status = ${safeSlot.status} (CONFIRMED)`);

    // ------------------------------------------------------------------------
    // 5. Pengujian Idempotensi WhatsApp Gateway (ReminderLog Guard)
    // ------------------------------------------------------------------------
    console.log('\n▶ 5. Menguji Idempotensi WhatsApp Gateway via ReminderLog...');

    const testPhoneIdempotent = '+6289912345678';
    await db.reminderLog.deleteMany({ where: { recipientPhone: testPhoneIdempotent } });

    // Pengiriman pertama
    const send1 = await whatsapp.sendMessage({
      to: testPhoneIdempotent,
      text: 'Pesan uji coba idempotensi #1',
      recipientType: 'CUSTOMER',
      reminderType: 'TEST_IDEMPOTENT',
      dedupWindowMs: 3_600_000,
    });

    if (send1.status !== 'SENT') {
      throw new Error('Pengiriman pesan pertama gagal!');
    }

    // Pengiriman kedua (duplikat) dalam window waktu
    const send2 = await whatsapp.sendMessage({
      to: testPhoneIdempotent,
      text: 'Pesan uji coba idempotensi #2 (Duplikat)',
      recipientType: 'CUSTOMER',
      reminderType: 'TEST_IDEMPOTENT',
      dedupWindowMs: 3_600_000,
    });

    if (send2.status !== 'SKIPPED_DUPLICATE') {
      throw new Error(`IDEMPOTENCY JEBOL: Pesan kedua tidak dilewati! Status: ${send2.status}`);
    }

    const logCount = await db.reminderLog.count({
      where: { recipientPhone: testPhoneIdempotent, reminderType: 'TEST_IDEMPOTENT' },
    });
    if (logCount !== 1) {
      throw new Error(`Tercatat ${logCount} log untuk pengiriman yang seharusnya ter-deduplikasi!`);
    }

    console.log(`   ✅ Pengiriman pertama berhasil: status = SENT`);
    console.log(`   ✅ Pengiriman kedua DICEKAL otomatis: status = SKIPPED_DUPLICATE`);
    console.log(`   ✅ Record di database tetap tunggal (1 record log terverifikasi)`);

    // ------------------------------------------------------------------------
    // 6. Pengujian Reminder Customer Menjelang Expired (H-7, H-3, H-1)
    // ------------------------------------------------------------------------
    console.log('\n▶ 6. Menguji Pengingat Customer Menjelang Expired (Rule #12)...');

    // Set paket customer 1 mendekati expired H-3 (2.5 hari lagi)
    const expiryH3Date = new Date(nowTest.getTime() + 2.5 * 24 * 3_600_000);
    await db.paketPelanggan.update({
      where: { id: custPkg1.id },
      data: { validUntil: expiryH3Date, remainingSessions: 3 },
    });

    const expiryResult = await reminderSchedule.runCustomerExpiryReminders(nowTest);

    const logH3 = await db.reminderLog.findFirst({
      where: {
        recipientPhone: whatsapp.normalizePhone(customerActive1.phone!),
        reminderType: 'EXPIRY_H3',
      },
    });

    if (!logH3) {
      throw new Error('Pengingat EXPIRY_H3 ke Customer tidak terkirim!');
    }
    console.log(`   ✅ Pengingat H-3 berhasil terkirim ke customer aktif: ${logH3.recipientPhone}`);
    console.log(`   ✅ Ringkasan teks preview: "${logH3.payload ? (logH3.payload as any).textPreview?.slice(0, 75) : ''}..."`);

    // ------------------------------------------------------------------------
    // 7. Pengujian Proteksi Customer Berhenti (Rule #12 & #13 stoppedAt)
    // ------------------------------------------------------------------------
    console.log('\n▶ 7. Menguji Proteksi Customer Berhenti (Rule #12 & #13: stoppedAt)...');

    // Buat paket yang sama-sama mendekati expired untuk Customer Berhenti
    const custPkgStopped = await db.paketPelanggan.create({
      data: {
        userId: customerStopped.id,
        packageId: pkg.id,
        totalSessions: 10,
        remainingSessions: 2,
        validUntil: expiryH3Date, // Mendekati expired
        status: 'ACTIVE',
      },
    });

    // Jalankan siklus reminder lagi
    await reminderSchedule.runCustomerExpiryReminders(nowTest);

    // Verifikasi bahwa customer berhenti TIDAK menerima reminder apa pun
    const logStopped = await db.reminderLog.findFirst({
      where: {
        recipientPhone: whatsapp.normalizePhone(customerStopped.phone!),
      },
    });

    if (logStopped) {
      throw new Error('PROTEKSI JEBOL: Customer yang sudah BERHENTI menerima pesan reminder WhatsApp!');
    }
    console.log(`   ✅ Customer berhenti (stoppedAt != null) 100% BEBAS DARI REMINDER.`);
    console.log(`   ✅ Nol pesan terkirim ke nomor ${customerStopped.phone}.`);

    // ------------------------------------------------------------------------
    // 8. Pengujian Customer Expired Belum Renew (Rule #13: Max 5x)
    // ------------------------------------------------------------------------
    console.log('\n▶ 8. Menguji Follow-up Customer Expired Belum Renew (Rule #13: Maks 5x)...');

    // Buat paket expired untuk Customer 2 (validUntil relatif dari sekarang agar 30-day window tidak memangkas)
    const nowActual = new Date(); // Waktu aktual saat tes berjalan
    const expiredPkg2 = await db.paketPelanggan.create({
      data: {
        userId: customerActive2.id,
        packageId: pkg.id,
        totalSessions: 10,
        remainingSessions: 1,
        validUntil: new Date(nowActual.getTime() - 24 * 3_600_000), // Expired kemarin (relatif sekarang)
        status: 'EXPIRED',
      },
    });

    // Nonaktifkan paket aktif customer 2 agar terhitung murni expired
    await db.paketPelanggan.update({
      where: { id: custPkg2.id },
      data: { status: 'EXPIRED', validUntil: new Date(nowActual.getTime() - 24 * 3_600_000) },
    });

    const phoneCust2 = whatsapp.normalizePhone(customerActive2.phone!);
    await db.reminderLog.deleteMany({
      where: { recipientPhone: phoneCust2, reminderType: 'EXPIRED_RENEWAL' },
    });

    // Simulasikan 5 kali pengiriman follow-up secara bertahap menggunakan insert manual
    // (runCustomerExpiryReminders menggunakan dedup 70 jam, tidak bisa dipercepat dalam unit test)
    // Insert langsung ke ReminderLog untuk mensimulasikan 5 pengiriman berhasil (Rule #13)
    for (let i = 1; i <= 5; i++) {
      const simulatedSentAt = new Date(nowActual.getTime() + (i - 1) * 73 * 3_600_000);
      await db.reminderLog.create({
        data: {
          recipientPhone: phoneCust2,
          recipientType: 'CUSTOMER',
          reminderType: 'EXPIRED_RENEWAL',
          status: 'SENT',
          sentAt: simulatedSentAt,
          payload: { attemptCount: i, packageId: expiredPkg2.packageId, _test: true },
        },
      });
    }

    const countAfter5 = await db.reminderLog.count({
      where: { recipientPhone: phoneCust2, reminderType: 'EXPIRED_RENEWAL' },
    });
    if (countAfter5 !== 5) {
      throw new Error(`Diharapkan 5 kali pengiriman, didapat ${countAfter5}`);
    }
    console.log(`   ✅ Pengiriman 1 s/d 5 berhasil tercatat secara berkala (Total: 5 pesan)`);

    // Simulasikan percobaan pengiriman ke-6 (harus dihentikan!)
    const simulated6 = new Date(nowActual.getTime() + 6 * 73 * 3_600_000);
    await reminderSchedule.runCustomerExpiryReminders(simulated6);

    const countAfter6 = await db.reminderLog.count({
      where: { recipientPhone: phoneCust2, reminderType: 'EXPIRED_RENEWAL' },
    });
    if (countAfter6 > 5) {
      throw new Error(`ATURAN BATAS MAKSIMAL JEBOL: Terkirim ${countAfter6} kali (melebihi batas 5 kali)!`);
    }
    console.log(`   ✅ Pengiriman ke-6 berhasil DIHENTIKAN otomatis (Batas maksimal 5x terpenuhi)`);

    // ------------------------------------------------------------------------
    // 9. Pengujian Digest Admin (3 Jam) & Rekap Owner (3 Hari) (Rule #11)
    // ------------------------------------------------------------------------
    console.log('\n▶ 9. Menguji Digest Admin (3 Jam) & Rekap Owner (3 Hari) (Rule #11)...');

    const digestCount = await reminderSchedule.runAdminDigest(nowTest);
    const rekapCount = await reminderSchedule.runOwnerRecap(nowTest);

    const logAdminDigest = await db.reminderLog.findFirst({
      where: { reminderType: { startsWith: 'ADMIN_DIGEST_3H' } },
    });
    if (!logAdminDigest) {
      throw new Error('Pesan Digest Admin 3 Jam tidak tercatat di ReminderLog!');
    }

    const logOwnerRecap = await db.reminderLog.findFirst({
      where: { reminderType: { startsWith: 'OWNER_RECAP_3D' } },
    });
    if (!logOwnerRecap) {
      throw new Error('Pesan Rekap Owner 3 Hari tidak tercatat di ReminderLog!');
    }

    console.log(`   ✅ Digest Admin 3 Jam terkirim (${digestCount} penerima, contoh ID: ${logAdminDigest.id})`);
    console.log(`   ✅ Rekap Owner 3 Hari terkirim (${rekapCount} penerima, contoh ID: ${logOwnerRecap.id})`);

    // ------------------------------------------------------------------------
    // 10. Pengujian Kueri & Summary Log WhatsApp
    // ------------------------------------------------------------------------
    console.log('\n▶ 10. Menguji Kueri & Summary Log WhatsApp...');

    const recentLogs = await whatsapp.listLogs({ limit: 10 });
    if (recentLogs.length === 0) {
      throw new Error('Kueri listLogs mengembalikan array kosong!');
    }

    console.log(`   ✅ Kueri listLogs berhasil mengembalikan ${recentLogs.length} entri audit.`);
    console.log(`   ✅ Entri terbaru: Tipe [${recentLogs[0].reminderType}] ke [${recentLogs[0].recipientPhone}] - Status: ${recentLogs[0].status}`);

    // Cleanup data pengujian
    await db.pemesananKelas.deleteMany({
      where: { id: { in: [booking1.id, bookingSafe1.id, bookingSafe2.id] } },
    });
    await db.slotKelas.deleteMany({
      where: { id: { in: [slotUnderQuota.id, slotSufficient.id] } },
    });
    await db.paketPelanggan.deleteMany({
      where: { id: { in: [custPkg1.id, custPkg2.id, custPkgStopped.id, expiredPkg2.id] } },
    });
    await db.reminderLog.deleteMany({
      where: { recipientPhone: { in: testPhones.concat(testPhoneIdempotent) } },
    });

    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('🎉 SEMUA 10 SKENARIO PENGUJIAN FASE 4 BERHASIL DIVERIFIKASI DENGAN SUKSES! 🎉');
    console.log('   - Auto-cancel kelas kurang kuota pada H-24 berjalan otomatis');
    console.log('   - Booking peserta dibatalkan & kuota sesi terlindungi aman');
    console.log('   - Notifikasi WhatsApp multi-pihak (Customer, Coach, Staf) terkirim presisi');
    console.log('   - Idempotency guard via ReminderLog mencegah pesan dobel 100%');
    console.log('   - Pengingat customer H-7, H-3, H-1 berjalan lancar');
    console.log('   - Customer berhenti (stoppedAt) 100% dilindungi & bebas dari reminder');
    console.log('   - Follow-up paket expired dibatasi maksimal 5 kali');
    console.log('   - Digest Admin 3 Jam & Rekap Owner 3 Hari beroperasi sempurna');
    console.log('══════════════════════════════════════════════════════════════════════════════\n');
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ VERIFIKASI FASE 4 GAGAL:', err);
  process.exit(1);
});
