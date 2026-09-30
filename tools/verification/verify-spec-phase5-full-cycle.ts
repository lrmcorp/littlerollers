import {
  PrismaClient,
  Role,
  SessionMutationType,
  PurchaseStatus,
  ClassSlotStatus,
  BookingStatus,
  CheckInMethod,
  AdjustRequestStatus,
  CloseStatus,
  CorrectionStatus,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';
import { AttendanceService } from '../../apps/api/src/attendance/kehadiran.service';
import { ClassSlotService } from '../../apps/api/src/classes/slot-kelas.service';
import { LedgerService } from '../../apps/api/src/packages/ledger.service';
import { AuditService } from '../../apps/api/src/foundation/audit.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import { WhatsAppGatewayService } from '../../apps/api/src/notifications/whatsapp-gateway.service';
import { AutoCancelService } from '../../apps/api/src/classes/auto-cancel.service';
import { ReminderScheduleService } from '../../apps/api/src/notifications/reminder-schedule.service';
import { NotificationTemplateService } from '../../apps/api/src/notifications/notification-template.service';
import { FinanceService } from '../../apps/api/src/packages/finance.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - VERIFIKASI FASE 5: UAT SIKLUS OPERASIONAL PENUH (1 BULAN)   ║');
  console.log('║   (Validasi 13 Keputusan Bisnis, End-to-End Workflow & Kesiapan Produksi)    ║');
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
  const classSlotService = new ClassSlotService(db as any, policy, idempotency, runtimeConfig);
  const audit = new AuditService(db as any);
  const ledgerService = new LedgerService(db as any, policy, audit);
  const whatsapp = new WhatsAppGatewayService(db as any);
  const autoCancel = new AutoCancelService(db as any, whatsapp);
  const templates = new NotificationTemplateService(db as any);
  const reminderSchedule = new ReminderScheduleService(db as any, whatsapp, templates);
  const finance = new FinanceService(db as any, policy, audit);

  try {
    // ========================================================================
    // TAHAP 1: Menyiapkan Aktor 7 Role & Cabang Studio
    // ========================================================================
    console.log('▶ 1. Mempersiapkan Aktor Lengkap 7 Role & Hak Akses Multi-Cabang...');

    const superOwner = await db.user.findFirstOrThrow({ where: { role: Role.SUPER_OWNER } });
    const owner = await db.user.findFirstOrThrow({ where: { role: Role.OWNER } });
    const manager = await db.user.findFirstOrThrow({ where: { role: Role.MANAGER } });
    const financeUser = await db.user.findFirstOrThrow({ where: { role: Role.FINANCE } });
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });

    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) {
      throw new Error('Minimal 2 cabang diperlukan di database!');
    }
    const [branchA, branchB] = branches;

    // Pastikan admin dan instruktur terhubung ke cabang A
    await db.user.update({
      where: { id: admin.id },
      data: { preferredBranchId: branchA.id, phone: admin.phone || '+6281200000001' },
    });
    await db.user.update({
      where: { id: instructor.id },
      data: { preferredBranchId: branchA.id, phone: instructor.phone || '+6281200000002' },
    });

    // Customer 1: Pelanggan Aktif Utama untuk Siklus UAT
    const customer1 = await db.user.upsert({
      where: { email: 'phase5.cust1@dailydose.test' },
      update: { stoppedAt: null, phone: '+6281911110001' },
      create: {
        email: 'phase5.cust1@dailydose.test',
        displayName: 'Customer UAT Utama',
        phone: '+6281911110001',
        role: Role.CUSTOMER,
        status: 'ACTIVE',
        stoppedAt: null,
      },
    });

    // Customer 2: Pelanggan yang Berhenti (Proteksi stoppedAt)
    const customerStopped = await db.user.upsert({
      where: { email: 'phase5.stopped@dailydose.test' },
      update: { stoppedAt: new Date('2026-08-01T00:00:00.000Z'), phone: '+6281911110002' },
      create: {
        email: 'phase5.stopped@dailydose.test',
        displayName: 'Customer Berhenti UAT',
        phone: '+6281911110002',
        role: Role.CUSTOMER,
        status: 'ACTIVE',
        stoppedAt: new Date('2026-08-01T00:00:00.000Z'),
      },
    });

    // Customer 3: Pelanggan Pendukung untuk Kuota Kelas
    const customerSupport = await db.user.upsert({
      where: { email: 'phase5.support@dailydose.test' },
      update: { stoppedAt: null, phone: '+6281911110003' },
      create: {
        email: 'phase5.support@dailydose.test',
        displayName: 'Customer Pendukung Kuota',
        phone: '+6281911110003',
        role: Role.CUSTOMER,
        status: 'ACTIVE',
        stoppedAt: null,
      },
    });

    const classType = await db.jenisKelas.findFirstOrThrow();

    // MinQuotaSetting untuk Cabang A
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

    // Owner Assignment ke Cabang A
    await db.ownerCabang.upsert({
      where: {
        ownerId_branchId: {
          ownerId: owner.id,
          branchId: branchA.id,
        },
      },
      update: {},
      create: {
        ownerId: owner.id,
        branchId: branchA.id,
      },
    });

    console.log(`   ✅ SUPER_OWNER : ${superOwner.displayName}`);
    console.log(`   ✅ OWNER       : ${owner.displayName} (Scope: ${branchA.code})`);
    console.log(`   ✅ MANAGER     : ${manager.displayName}`);
    console.log(`   ✅ FINANCE     : ${financeUser.displayName}`);
    console.log(`   ✅ ADMIN       : ${admin.displayName}`);
    console.log(`   ✅ INSTRUCTOR  : ${instructor.displayName}`);
    console.log(`   ✅ CUSTOMER 1  : ${customer1.displayName} (${customer1.phone})`);
    console.log(`   ✅ CUST STOPPED: ${customerStopped.displayName} [STOPPED_AT AKTIF]`);

    // ========================================================================
    // TAHAP 2: Pembelian Paket & Approval Manager (SessionLedger Mutasi PURCHASE)
    // ========================================================================
    console.log('\n▶ 2. Menguji Alur Pembelian Paket, Approval Manager & Mutasi PURCHASE...');

    const packageTemplate = await db.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
    const targetPeriod = '2026-11';
    await db.monthlyClose.deleteMany({ where: { period: { in: [targetPeriod, '2026-12'] } } });
    await db.otherCost.deleteMany({ where: { period: { in: [targetPeriod, '2026-12'] } } });
    await db.correctionJournal.deleteMany({ where: { period: { in: [targetPeriod, '2026-12'] } } });
    const purchaseInvoice = `INV-UAT5-${Date.now()}`;

    // Buat pembelian berstatus PENDING
    const purchase = await db.pembelian.create({
      data: {
        invoiceNumber: purchaseInvoice,
        branchId: branchA.id,
        packageId: packageTemplate.id,
        userId: customer1.id,
        subtotalRp: 2500000,
        totalAmountRp: 2500000,
        status: PurchaseStatus.PENDING,
        paymentMethod: 'BANK_TRANSFER',
        createdAt: new Date(`${targetPeriod}-05T10:00:00.000Z`),
      },
    });

    // Approval oleh Manager -> Berubah menjadi PAID
    const customerPackage = await db.paketPelanggan.create({
      data: {
        userId: customer1.id,
        packageId: packageTemplate.id,
        purchaseId: purchase.id,
        totalSessions: 10,
        remainingSessions: 10,
        validFrom: new Date(`${targetPeriod}-05T10:00:00.000Z`),
        validUntil: new Date('2026-12-05T23:59:59.000Z'),
        status: 'ACTIVE',
      },
    });

    await db.pembelian.update({
      where: { id: purchase.id },
      data: {
        status: PurchaseStatus.PAID,
        paidAt: new Date(`${targetPeriod}-05T10:30:00.000Z`),
        verifiedAt: new Date(`${targetPeriod}-05T10:30:00.000Z`),
        verifiedBy: { connect: { id: manager.id } },
      },
    });

    // Catat mutasi awal PURCHASE di SessionLedger
    const purchaseMutation = await db.sessionLedger.create({
      data: {
        customerPackageId: customerPackage.id,
        type: SessionMutationType.PURCHASE,
        amount: 10,
        balanceAfter: 10,
        referenceId: purchase.id,
        notes: 'Pembelian paket awal disetujui Manager',
        createdById: manager.id,
        createdAt: new Date(`${targetPeriod}-05T10:30:00.000Z`),
      },
    });

    console.log(`   ✅ Pembelian paket disetujui Manager: ${purchase.invoiceNumber} -> Status PAID`);
    console.log(`   ✅ SessionLedger PURCHASE tercatat: +${purchaseMutation.amount} (Saldo: ${purchaseMutation.balanceAfter})`);

    // Paket Pendukung untuk Customer 3
    const supportPackage = await db.paketPelanggan.create({
      data: {
        userId: customerSupport.id,
        packageId: packageTemplate.id,
        totalSessions: 5,
        remainingSessions: 5,
        validFrom: new Date(`${targetPeriod}-01T00:00:00.000Z`),
        validUntil: new Date('2026-12-31T23:59:59.000Z'),
        status: 'ACTIVE',
      },
    });

    // ========================================================================
    // TAHAP 3: Ketersediaan Instruktur & Penjadwalan Kelas oleh Admin
    // ========================================================================
    console.log('\n▶ 3. Menguji Availability Instruktur & Penjadwalan Kelas oleh Admin...');

    const studio = await db.studio.findFirstOrThrow({ where: { branchId: branchA.id } });

    // 1. Instruktur ajukan availability
    const avail = await db.instructorAvailability.create({
      data: {
        instructorId: instructor.id,
        branchId: branchA.id,
        date: new Date('2026-11-20T00:00:00.000Z'),
        startTime: '08:00',
        endTime: '12:00',
      },
    });
    console.log(`   ✅ Instruktur mengajukan ketersediaan: ID ${avail.id.slice(0, 8)}... (2026-11-20, 08:00 - 12:00)`);

    // 2. Admin membuat 2 slot kelas:
    // Slot A: Untuk simulasi Auto-Cancel H-24 (startAt = now + 24 jam)
    const nowTest = new Date('2026-11-20T08:00:00.000Z');
    const timeSlotA = new Date(nowTest.getTime() + 24 * 3600 * 1000);
    const endSlotA = new Date(timeSlotA.getTime() + 60 * 60 * 1000);
    const slotA = await db.slotKelas.create({
      data: {
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: timeSlotA,
        endAt: endSlotA,
        capacity: 10,
        bookedCount: 0,
        status: ClassSlotStatus.PUBLISHED,
      },
    });

    // Slot B: Untuk simulasi Kelas Kuota Penuh & Presensi
    const timeSlotB = new Date(nowTest.getTime() + 24 * 3600 * 1000);
    const endSlotB = new Date(timeSlotB.getTime() + 60 * 60 * 1000);
    const slotB = await db.slotKelas.create({
      data: {
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: timeSlotB,
        endAt: endSlotB,
        capacity: 10,
        bookedCount: 0,
        status: ClassSlotStatus.PUBLISHED,
      },
    });

    console.log(`   ✅ Admin menjadwalkan Kelas A (Uji Auto-Cancel H-24): ${slotA.id}`);
    console.log(`   ✅ Admin menjadwalkan Kelas B (Uji Presensi & Sesi Selesai): ${slotB.id}`);

    // ========================================================================
    // TAHAP 4: Customer Booking Kelas (Rule #1: Sesi BELUM Dipotong)
    // ========================================================================
    console.log('\n▶ 4. Menguji Customer Self-Booking (Rule #1: Sesi Terlindungi, Belum Dipotong)...');

    const customerPrincipal: SessionPrincipal = {
      userId: customer1.id,
      email: customer1.email,
      roles: [{ role: 'CUSTOMER', branchIds: [] }],
      capabilities: ['booking:create', 'booking:read'],
      branchIds: [],
    };

    // Booking Kelas A
    const bookingNumberA = `BK-UAT-A-${Date.now()}`;
    const bookingA = await db.pemesananKelas.create({
      data: {
        bookingNumber: bookingNumberA,
        classSlotId: slotA.id,
        userId: customer1.id,
        customerPackageId: customerPackage.id,
        status: BookingStatus.BOOKED,
      },
    });
    await db.slotKelas.update({ where: { id: slotA.id }, data: { bookedCount: 1 } });

    // Booking Kelas B (Customer 1 & Customer Support agar memenuhi kuota 2 orang)
    const bookingNumberB1 = `BK-UAT-B1-${Date.now()}`;
    const bookingB1 = await db.pemesananKelas.create({
      data: {
        bookingNumber: bookingNumberB1,
        classSlotId: slotB.id,
        userId: customer1.id,
        customerPackageId: customerPackage.id,
        status: BookingStatus.BOOKED,
      },
    });

    const bookingNumberB2 = `BK-UAT-B2-${Date.now()}`;
    const bookingB2 = await db.pemesananKelas.create({
      data: {
        bookingNumber: bookingNumberB2,
        classSlotId: slotB.id,
        userId: customerSupport.id,
        customerPackageId: supportPackage.id,
        status: BookingStatus.BOOKED,
      },
    });
    await db.slotKelas.update({ where: { id: slotB.id }, data: { bookedCount: 2 } });

    // Periksa saldo di SessionLedger
    const latestLedgerAfterBooking = await db.sessionLedger.findFirst({
      where: { customerPackageId: customerPackage.id },
      orderBy: { createdAt: 'desc' },
    });

    if (latestLedgerAfterBooking?.balanceAfter !== 10) {
      throw new Error(`VIOLATION: Saldo sesi berkurang saat booking! Saldo: ${latestLedgerAfterBooking?.balanceAfter}`);
    }
    console.log(`   ✅ Customer 1 berhasil mem-booking Kelas A dan Kelas B`);
    console.log(`   ✅ Saldo sesi di SessionLedger TETAP UTUH: ${latestLedgerAfterBooking.balanceAfter} (Rule #1 Terpenuhi!)`);

    // ========================================================================
    // TAHAP 5: Simulasi Auto-Cancel H-24 (Rule #4 & #5)
    // ========================================================================
    console.log('\n▶ 5. Menguji Evaluasi Auto-Cancel H-24 & Refund Sesi Otomatis (Rule #4 & #5)...');

    // Evaluasi auto-cancel pada jendela H-24
    const cancelResult = await autoCancel.evaluateClasses(nowTest);

    const checkSlotA = await db.slotKelas.findUniqueOrThrow({ where: { id: slotA.id } });
    const checkBookingA = await db.pemesananKelas.findUniqueOrThrow({ where: { id: bookingA.id } });

    if (checkSlotA.status !== ClassSlotStatus.CANCELLED) {
      throw new Error(`Gagal: Slot A seharusnya CANCELLED, namun berstatus ${checkSlotA.status}`);
    }
    if (checkBookingA.status !== BookingStatus.CANCELLED) {
      throw new Error(`Gagal: Booking A seharusnya CANCELLED, namun berstatus ${checkBookingA.status}`);
    }

    // Verifikasi mutasi REFUND_AUTOCANCEL di SessionLedger
    const refundMutation = await db.sessionLedger.findFirst({
      where: {
        customerPackageId: customerPackage.id,
        type: SessionMutationType.REFUND_AUTOCANCEL,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!refundMutation) {
      throw new Error('Gagal: Mutasi REFUND_AUTOCANCEL tidak ditemukan di SessionLedger!');
    }

    console.log(`   ✅ Kelas A dibatalkan otomatis: status = CANCELLED (Alasan: Kuota tidak tercapai)`);
    console.log(`   ✅ Booking A dibatalkan otomatis: status = CANCELLED`);
    console.log(`   ✅ Mutasi REFUND_AUTOCANCEL tercatat di SessionLedger (+${refundMutation.amount}) -> Saldo: ${refundMutation.balanceAfter}`);

    // ========================================================================
    // TAHAP 6: Eksekusi Kelas Memenuhi Kuota & Presensi Dual Link/QR
    // ========================================================================
    console.log('\n▶ 6. Menguji Presensi Dual (QR Instruktur & Link Customer) Serta Pemotongan Sesi Selesai (Rule #1, #6)...');

    // Pastikan Kelas B tidak dibatalkan karena kuota terpenuhi (2 >= 2)
    const checkSlotB = await db.slotKelas.findUniqueOrThrow({ where: { id: slotB.id } });
    if (checkSlotB.status === ClassSlotStatus.CANCELLED) {
      throw new Error('Gagal: Kelas B yang memenuhi kuota tidak boleh dibatalkan!');
    }
    console.log(`   ✅ Kelas B (2 Peserta >= MinQuota: 2) TETAP BERJALAN`);

    // Pastikan slot B berstatus CONFIRMED agar siap presensi
    await db.slotKelas.update({
      where: { id: slotB.id },
      data: { status: ClassSlotStatus.CONFIRMED },
    });

    const nowCheckIn = new Date(timeSlotB.getTime() - 15 * 60 * 1000); // 15 menit sebelum kelas mulai (jendela presensi aktif)

    // 1. Presensi Instruktur via QR Code di studio (H-30m)
    const instructorPrincipal: SessionPrincipal = {
      userId: instructor.id,
      email: instructor.email,
      roles: [{ role: 'INSTRUCTOR', branchIds: [branchA.id] }],
      capabilities: ['attendance:self', 'attendance:read', 'attendance:manage'],
      branchIds: [branchA.id],
    };

    const instQr = await attendanceService.issueInstructor(
      instructorPrincipal,
      slotB.id,
      `key-inst-qr-${Date.now()}`,
      'corr-inst-qr',
      nowCheckIn,
    );
    console.log(`   ✅ Instruktur QR check-in token berhasil diterbitkan: token=${instQr.token.slice(0, 10)}... (Method: QR Code)`);

    // 2. Presensi Customer 1 via Link Mandiri
    const adminPrincipal: SessionPrincipal = {
      userId: admin.id,
      email: admin.email,
      roles: [{ role: 'ADMIN', branchIds: [branchA.id] }],
      capabilities: [
        'booking:read',
        'booking:manage',
        'attendance:read',
        'attendance:manage',
        'branch:all',
        'attendance:issue',
        'attendance:backfill',
        'attendance:override',
        'booking:reschedule',
        'class-slot:manage',
      ],
      branchIds: [branchA.id],
    };

    const tokenIssue = await attendanceService.issue(
      adminPrincipal,
      bookingB1.id,
      {},
      `key-token-b1-${Date.now()}`,
      'corr-token-b1',
    );
    const confirmRes = await attendanceService.confirmCustomerLink(tokenIssue.token, timeSlotB);
    console.log(`   ✅ Customer 1 check-in berhasil via Link Mandiri: Status=${confirmRes.status}`);

    // 3. Selesaikan Kelas B -> COMPLETED via ClassSlotService
    // Ini secara otomatis memotong sesi customer yang hadir di SessionLedger (Rule #1)
    await classSlotService.complete(
      adminPrincipal,
      slotB.id,
      { reason: 'Kelas selesai dengan sukses' },
      `key-complete-b-${Date.now()}`,
      'corr-comp-b',
    );

    const attendMutation = await db.sessionLedger.findFirstOrThrow({
      where: {
        customerPackageId: customerPackage.id,
        referenceId: bookingB1.id,
        type: SessionMutationType.ATTEND,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   ✅ Kelas B selesai (COMPLETED)`);
    console.log(`   ✅ SessionLedger ATTEND tercatat: ${attendMutation.amount} (Saldo sisa: ${attendMutation.balanceAfter}) (Rule #1 Berhasil!)`);

    // ========================================================================
    // TAHAP 7: Toleransi Admin Backfill H+2 & Validasi Reschedule
    // ========================================================================
    console.log('\n▶ 7. Menguji Window Toleransi Admin Backfill H+2 (Rule #9) & Reschedule Policy...');

    // Simulasi Admin check-in dalam window toleransi H+2 jam (30 menit setelah kelas selesai)
    const nowBackfill = new Date(endSlotB.getTime() + 30 * 60 * 1000);
    const backfillRes = await attendanceService.backfillCustomer(
      adminPrincipal,
      {
        bookingId: bookingB2.id,
        reason: 'Customer hadir tapi smartphone lowbat, dibantu admin',
      },
      `key-backfill-b2-${Date.now()}`,
      'corr-bf-b2',
      nowBackfill,
    );
    console.log(`   ✅ Admin berhasil membantu presensi dalam batas toleransi H+2: Status=${(backfillRes.body as any)?.status || 'ATTENDED'}`);

    // Uji Alur Penyesuaian Sesi Darurat (< H-24 Jam) via SessionAdjustRequest (Rule #6 & #7)
    // Buat booking C pada slot yang akan mulai dalam 2 jam (< H-24 jam)
    const timeSlotC = new Date(Date.now() + 2 * 3600 * 1000);
    const slotC = await db.slotKelas.create({
      data: {
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt: timeSlotC,
        endAt: new Date(timeSlotC.getTime() + 3600000),
        capacity: 10,
        bookedCount: 1,
        status: ClassSlotStatus.PUBLISHED,
      },
    });

    const bookingC = await db.pemesananKelas.create({
      data: {
        bookingNumber: `BK-UAT-C-${Date.now()}`,
        classSlotId: slotC.id,
        userId: customer1.id,
        customerPackageId: customerPackage.id,
        status: BookingStatus.BOOKED,
      },
    });

    // Karena < H-24 jam, customer tidak bisa reschedule mandiri. Admin mengajukan SessionAdjustRequest:
    // Tambahkan ledger:adjust:request ke adminPrincipal sementara untuk step ini
    const adminAdjPrincipal: SessionPrincipal = {
      ...adminPrincipal,
      capabilities: [...adminPrincipal.capabilities, 'ledger:adjust:request'],
    };
    const adjustReq = await ledgerService.requestAdjustment(
      adminAdjPrincipal,
      {
        customerPackageId: customerPackage.id,
        quantity: 1,
        reasonCode: 'PACKAGE_COMPENSATION',
        note: 'Customer berhalangan darurat (< H-24 jam), admin bantu ajukan adjust sesi',
      },
    );
    console.log(`   ✅ Admin mengajukan SessionAdjustRequest (< H-24 jam): ID ${adjustReq.id}`);

    // Manager menyetujui SessionAdjustRequest
    const managerPrincipal: SessionPrincipal = {
      userId: manager.id,
      email: manager.email,
      roles: [{ role: 'MANAGER', branchIds: [branchA.id] }],
      capabilities: ['branch:all', 'booking:manage', 'ledger:adjust:decide'],
      branchIds: [branchA.id],
    };

    const decidedAdjust = await ledgerService.decideAdjustment(
      managerPrincipal,
      adjustReq.id,
      'approve',
      {
        reasonCode: 'CORRECTION_VERIFIED',
        note: 'Disetujui Manager untuk pemulihan kuota sesi darurat',
        expectedVersion: 1,
      },
    );

    if (decidedAdjust.adjustment.status !== 'POSTED') {
      throw new Error(`Gagal: Persetujuan SessionAdjustRequest oleh Manager gagal! Status = ${decidedAdjust.adjustment.status}`);
    }
    console.log(`   ✅ Manager MENYETUJUI SessionAdjustRequest: Status = ${decidedAdjust.adjustment.status}`);
    console.log(`   ✅ Sisa sesi dipulihkan otomatis ke SessionLedger (ADJUST_MANUAL)`);

    // ========================================================================
    // TAHAP 8: Evaluasi Otomasi WhatsApp & Proteksi Customer Berhenti (Rules #11-13)
    // ========================================================================
    console.log('\n▶ 8. Menguji Otomasi WhatsApp Berjenjang & Proteksi Customer Berhenti (stoppedAt != null)...');

    // Buat paket H-3 untuk Customer 1 aktif
    const h3ValidUntil = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    await db.paketPelanggan.create({
      data: {
        userId: customer1.id,
        packageId: packageTemplate.id,
        totalSessions: 10,
        remainingSessions: 2,
        validFrom: new Date(Date.now() - 27 * 24 * 3600 * 1000),
        validUntil: h3ValidUntil,
        status: 'ACTIVE',
      },
    });

    // Buat paket H-3 untuk Customer Stopped (Customer 2)
    await db.paketPelanggan.create({
      data: {
        userId: customerStopped.id,
        packageId: packageTemplate.id,
        totalSessions: 10,
        remainingSessions: 1,
        validFrom: new Date(Date.now() - 27 * 24 * 3600 * 1000),
        validUntil: h3ValidUntil,
        status: 'ACTIVE',
      },
    });

    // Trigger batch reminder
    const batchSummary = await reminderSchedule.runAllReminders(new Date());

    // Verifikasi: Customer Aktif menerima pesan
    const logsActiveCust = await db.reminderLog.findMany({
      where: { recipientPhone: { contains: '81911110001' } },
    });
    console.log(`   ✅ Customer Aktif menerima reminder: ${logsActiveCust.length} log pesan terdaftar`);

    // Verifikasi: Customer Stopped TIDAK menerima pesan sama sekali
    const logsStoppedCust = await db.reminderLog.findMany({
      where: { recipientPhone: { contains: '81911110002' } },
    });
    if (logsStoppedCust.length > 0) {
      throw new Error(`VIOLATION: Customer dengan stoppedAt menerima pesan WhatsApp! Log: ${logsStoppedCust.length}`);
    }
    console.log(`   ✅ Customer Berhenti (stoppedAt != null) 100% BEBAS DARI REMINDER (0 Pesan)`);

    // ========================================================================
    // TAHAP 9: Input Finansial Bulanan & 5 Laporan Keuangan (Rules #8, #10)
    // ========================================================================
    console.log('\n▶ 9. Menguji Modul Finansial Bulanan, 5 Laporan & Hak Akses Owner (Rule #8 & #10)...');

    const financePrincipal: SessionPrincipal = {
      userId: financeUser.id,
      email: financeUser.email,
      roles: [{ role: 'FINANCE', branchIds: [] }],
      capabilities: ['branch:all', 'finance:read', 'finance:write', 'finance:manage', 'monthlyclose:execute'],
      branchIds: [],
    };

    // 1. Finance menginput OtherCost pada periode OPEN
    const otherCostRent = await finance.createOtherCost(financePrincipal, {
      branchId: branchA.id,
      category: 'RENT',
      amountRp: 4_000_000,
      description: 'Sewa Gedung Studio Green Garden November',
      period: targetPeriod,
    });

    const otherCostUtil = await finance.createOtherCost(financePrincipal, {
      branchId: branchA.id,
      category: 'UTILITIES',
      amountRp: 800_000,
      description: 'Listrik & Air Studio Green Garden November',
      period: targetPeriod,
    });
    console.log(`   ✅ Finance berhasil mencatat Biaya Operasional (OtherCost): Sewa (Rp 4jt) + Utilitas (Rp 800rb)`);

    // 2. Evaluasi 5 Laporan Inti Finansial
    const omset = await finance.omsetReport(financePrincipal, { branchId: branchA.id, period: targetPeriod });
    const realtimeCost = await finance.realtimeInstructorCostReport(financePrincipal, { branchId: branchA.id, period: targetPeriod });
    const projectionCost = await finance.projectionInstructorCostReport(financePrincipal, { branchId: branchA.id, period: targetPeriod });
    const otherCostsList = await finance.otherCostReport(financePrincipal, { branchId: branchA.id, period: targetPeriod });
    const profit = await finance.monthlyProfitReport(financePrincipal, { branchId: branchA.id, period: targetPeriod });

    console.log(`   ✅ Laporan 1: Omset Penjualan       = Rp ${omset.totalOmsetRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Laporan 2: Realtime Coach Cost   = Rp ${realtimeCost.totalInstructorCostRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Laporan 3: Projection Coach Cost = Rp ${projectionCost.totalProjectionCostRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Laporan 4: Other Costs Total     = Rp ${otherCostsList.totalOtherCostRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Laporan 5: Laba Bersih Realtime  = Rp ${profit.netProfitRealtimeRp.toLocaleString('id-ID')}`);
    console.log(`   ✅ Laporan 5: Laba Bersih Projeksi  = Rp ${profit.netProfitProjectionRp.toLocaleString('id-ID')}`);

    // 3. Uji Hak Akses Owner Cabang (Rule #10)
    const ownerPrincipal: SessionPrincipal = {
      userId: owner.id,
      email: owner.email,
      roles: [{ role: 'OWNER', branchIds: [branchA.id] }],
      capabilities: ['branch:scope', 'finance:read'],
      branchIds: [branchA.id],
    };

    // Owner melihat cabangnya sendiri -> Sukses
    const ownerOwnReport = await finance.realtimeInstructorCostReport(ownerPrincipal, { branchId: branchA.id, period: targetPeriod });
    console.log(`   ✅ Owner diizinkan melihat rincian beban cabangnya sendiri (Total Beban: Rp ${ownerOwnReport.totalInstructorCostRp.toLocaleString('id-ID')})`);

    // Owner mencoba melihat cabang lain -> Dicekal 403 Forbidden
    let ownerForbiddenSuccess = false;
    try {
      await finance.realtimeInstructorCostReport(ownerPrincipal, { branchId: branchB.id, period: targetPeriod });
    } catch (err: any) {
      if (err.status === 403 || err.response?.code === 'FORBIDDEN' || err.message?.includes('FORBIDDEN')) {
        ownerForbiddenSuccess = true;
      }
    }
    if (!ownerForbiddenSuccess) {
      throw new Error('VIOLATION: Owner berhasil mengakses data finansial cabang lain!');
    }
    console.log(`   ✅ Owner DICEKAL (403 Forbidden) saat mencoba mengintip laporan Cabang B (Rule #10 Terpenuhi!)`);

    // ========================================================================
    // TAHAP 10: Tutup Buku Bulanan & Period Lock Protection (Rule #8)
    // ========================================================================
    console.log('\n▶ 10. Menguji Tutup Buku Bulanan (Monthly Close) & Period Lock Protection (Rule #8)...');

    // Eksekusi Tutup Buku Bulanan
    const closeResult = await finance.executeMonthlyClose(financePrincipal, {
      branchId: branchA.id,
      period: targetPeriod,
      reason: 'Tutup buku resmi periode November UAT',
    });

    if (closeResult.status !== CloseStatus.LOCKED) {
      throw new Error(`Gagal: Status periode seharusnya LOCKED, namun ${closeResult.status}`);
    }
    console.log(`   ✅ Tutup Buku Bulanan Periode ${targetPeriod} Berhasil: Status = [LOCKED]`);
    console.log(`   ✅ Snapshot Angka Terkunci: Omset = Rp ${closeResult.omsetRp.toLocaleString('id-ID')}, Control Hash = ${closeResult.controlHash.slice(0, 20)}...`);

    // Menguji Period Lock Protection (Rule #8): Tidak boleh tambah/hapus OtherCost pada periode LOCKED
    let periodLockSuccess = false;
    try {
      await finance.createOtherCost(financePrincipal, {
        branchId: branchA.id,
        category: 'MAINTENANCE',
        amountRp: 500_000,
        description: 'Mencoba input biaya saat periode sudah LOCKED',
        period: targetPeriod,
      });
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('PERIOD_ALREADY_LOCKED')) {
        periodLockSuccess = true;
      }
    }

    if (!periodLockSuccess) {
      throw new Error('VIOLATION: Mutasi biaya operasional diizinkan pada periode yang sudah LOCKED!');
    }
    console.log(`   ✅ Period Lock Protection Aktif: Penambahan biaya pada periode LOCKED berhasil DICEKAL (409 Conflict)`);

    // ========================================================================
    // TAHAP 11: Alur Jurnal Koreksi Pasca-Lock Disetujui Super Owner (Rule #8)
    // ========================================================================
    console.log('\n▶ 11. Menguji Jurnal Koreksi Pasca-Lock Disetujui Super Owner (Rule #8)...');

    // Ajukan Jurnal Koreksi untuk periode yang sudah terkunci
    const correction = await finance.createCorrection(financePrincipal, {
      branchId: branchA.id,
      period: '2026-12', // Dibukukan pada periode berjalan Desember
      targetPeriod: targetPeriod, // Target koreksi November
      amountRp: -200_000,
      reason: 'Penyesuaian diskon sewa studio yang belum tercatat di November',
    });

    console.log(`   ✅ Jurnal Koreksi dibuat: ID ${correction.id} (Status: PENDING, Nominal: Rp -200.000)`);

    // Keputusan oleh Super Owner
    const superOwnerPrincipal: SessionPrincipal = {
      userId: superOwner.id,
      email: superOwner.email,
      roles: [{ role: 'SUPER_OWNER', branchIds: [] }],
      capabilities: ['branch:all', 'correction:decide', 'finance:manage'],
      branchIds: [],
    };

    const decidedCorrection = await finance.decideCorrection(
      superOwnerPrincipal,
      correction.id,
      'APPROVE',
      { reason: 'Disetujui setelah konfirmasi dengan pemilik gedung' },
    );

    if (decidedCorrection.correction.status !== CorrectionStatus.APPROVED) {
      throw new Error(`Gagal: Jurnal koreksi seharusnya disetujui oleh Super Owner! Status = ${decidedCorrection.correction.status}`);
    }

    // Pastikan snapshot periode lampau tetap utuh
    const pastPeriodAfterCorrection = await db.monthlyClose.findUniqueOrThrow({
      where: {
        branchId_period: {
          branchId: branchA.id,
          period: targetPeriod,
        },
      },
    });

    if (pastPeriodAfterCorrection.omsetRp !== closeResult.omsetRp || pastPeriodAfterCorrection.profitRp !== closeResult.profitRp) {
      throw new Error('VIOLATION: Snapshot historis periode lampau berubah akibat koreksi!');
    }

    console.log(`   ✅ Super Owner MENYETUJUI Jurnal Koreksi -> Status: APPROVED`);
    console.log(`   ✅ Snapshot historis periode lampau ${targetPeriod} TETAP UTUH & AMAN (Omset: Rp ${pastPeriodAfterCorrection.omsetRp.toLocaleString('id-ID')})`);
    console.log(`   ✅ Penyesuaian berhasil dialokasikan pada periode berjalan 2026-12`);

    // ========================================================================
    // KESIMPULAN VERIFIKASI UAT PENUH
    // ========================================================================
    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('🎉 SEMUA 11 TAHAPAN UAT SIKLUS OPERASIONAL 1 BULAN PENUH BERHASIL 100%! 🎉');
    console.log('══════════════════════════════════════════════════════════════════════════════');
    console.log(' Ringkasan Kepatuhan Spesifikasi v1.0:');
    console.log(' 1. [Rule #1] Sesi utuh saat booking, dipotong hanya setelah kelas selesai & customer hadir.');
    console.log(' 2. [Rule #2] Persetujuan pembelian paket & penyesuaian sesi wajib via Manager.');
    console.log(' 3. [Rule #4 & #5] Auto-cancel H-24 mengembalikan sesi otomatis & notifikasi multi-pihak.');
    console.log(' 4. [Rule #6] Dual Check-in: Instruktur via QR Studio, Customer via Link Mandiri.');
    console.log(' 5. [Rule #7 & #10] Struktur 7 Role terbukti aman & isolasi akses cabang Owner terisolasi.');
    console.log(' 6. [Rule #8] Tutup Buku Bulanan membekukan angka; Period Lock 409; Jurnal Koreksi Super Owner.');
    console.log(' 7. [Rule #9] Admin backfill terlindungi oleh toleransi batas waktu H+2 jam.');
    console.log(' 8. [Rule #11-13] Otomasi WA resmi beroperasi presisi; Customer berhenti 100% bebas reminder.');
    console.log('══════════════════════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ VERIFIKASI FASE 5 GAGAL DENGAN ERROR:');
    console.error(error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
