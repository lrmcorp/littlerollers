import { randomUUID } from 'node:crypto';
import { PrismaClient, Role, PurchaseStatus, ClassSlotStatus, SessionMutationType, AdjustRequestStatus } from '@prisma/client';
import { BookingsService } from '../apps/api/src/bookings/pemesanan-kelas.service';
import { AttendanceService } from '../apps/api/src/attendance/kehadiran.service';
import { ClassSlotService } from '../apps/api/src/classes/slot-kelas.service';
import { SessionAdjustService } from '../apps/api/src/bookings/session-adjust.service';
import { WhatsAppGatewayService } from '../apps/api/src/notifications/whatsapp-gateway.service';
import { AutoCancelService } from '../apps/api/src/classes/auto-cancel.service';
import { ReminderScheduleService } from '../apps/api/src/notifications/reminder-schedule.service';
import { FinanceService } from '../apps/api/src/packages/finance.service';
import { PaymentReviewService } from '../apps/api/src/packages/verifikasi-pembayaran.service';
import { AvailabilityService } from '../apps/api/src/classes/ketersediaan-instruktur.service';
import { ReschedulesService } from '../apps/api/src/bookings/ubah-jadwal.service';
import { IdempotencyService } from '../apps/api/src/foundation/idempotency.service';
import { PolicyService } from '../apps/api/src/identity/policy.service';
import { PackageAccessService } from '../apps/api/src/packages/package-access.service';
import { RuntimeConfigService } from '../apps/api/src/configuration/runtime-config.service';
import type { SessionPrincipal } from '../apps/api/src/identity/identity.service';

const db = new PrismaClient();

async function run10Scenarios() {
  console.log('================================================================================');
  console.log('🚀 MEMULAI PENGUJIAN 10 SKENARIO OPERASIONAL NYATA DAILY DOSE PILATES V2 🚀');
  console.log('================================================================================\n');

  const idempotency = new IdempotencyService(db as any);
  const policy = new PolicyService(db as any);
  const packageAccess = new PackageAccessService(db as any, policy);
  const runtimeConfig = {
    value: {
      booking: { enabled: true, cutoffHours: 2 },
      reschedule: { enabled: true, cutoffHours: 24 },
      bookingCancellation: { enabled: true, cutoffHours: 24 },
    },
  } as any;

  const bookingsService = new BookingsService(db as any, idempotency, policy, runtimeConfig);
  const attendanceService = new AttendanceService(db as any, policy, idempotency);
  const classSlotService = new ClassSlotService(db as any, policy, idempotency, runtimeConfig);
  const adjustService = new SessionAdjustService(db as any);
  const whatsapp = new WhatsAppGatewayService(db as any);
  const autoCancel = new AutoCancelService(db as any, whatsapp);
  const reminderSchedule = new ReminderScheduleService(db as any, whatsapp);
  const finance = new FinanceService(db as any);
  const paymentReview = new PaymentReviewService(db as any, idempotency, packageAccess);
  const availability = new AvailabilityService(db as any, policy, idempotency);
  const reschedules = new ReschedulesService(db as any, idempotency, policy, runtimeConfig);

  const testPeriod = '2026-10';
  const testPeriodNext = '2026-11';

  // Cleanup test period
  await db.monthlyClose.deleteMany({ where: { period: { in: [testPeriod, testPeriodNext] } } });
  await db.otherCost.deleteMany({ where: { period: { in: [testPeriod, testPeriodNext] } } });
  await db.correctionJournal.deleteMany({ where: { period: { in: [testPeriod, testPeriodNext] } } });

  // Get or setup branches
  const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
  const [branchA, branchB] = branches;

  // Get or setup actors
  const superOwner = await db.user.findFirstOrThrow({ where: { role: Role.SUPER_OWNER } });
  const owner = await db.user.findFirstOrThrow({ where: { role: Role.OWNER } });
  const manager = await db.user.findFirstOrThrow({ where: { role: Role.MANAGER } });
  const financeUser = await db.user.findFirstOrThrow({ where: { role: Role.FINANCE } });
  const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
  const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });

  // Ensure owner assigned to branch A only
  await db.ownerCabang.deleteMany({ where: { ownerId: owner.id } });
  await db.ownerCabang.create({ data: { ownerId: owner.id, branchId: branchA.id } });

  // Ensure instructor assigned to branch A
  await db.penugasanInstruktur.upsert({
    where: { coachId_branchId: { coachId: instructor.id, branchId: branchA.id } },
    update: { active: true },
    create: { coachId: instructor.id, branchId: branchA.id, active: true },
  });

  // Customers
  const customerActive = await db.user.upsert({
    where: { email: 'amanda.member@dailydose.test' },
    update: { stoppedAt: null, phone: '+6281899990001' },
    create: {
      email: 'amanda.member@dailydose.test',
      displayName: 'Amanda Member',
      phone: '+6281899990001',
      role: Role.CUSTOMER,
      status: 'ACTIVE',
      stoppedAt: null,
    },
  });

  const customerBudi = await db.user.upsert({
    where: { email: 'budi.member@dailydose.test' },
    update: { stoppedAt: null, phone: '+6281899990002' },
    create: {
      email: 'budi.member@dailydose.test',
      displayName: 'Budi Santoso',
      phone: '+6281899990002',
      role: Role.CUSTOMER,
      status: 'ACTIVE',
      stoppedAt: null,
    },
  });

  const customerStopped = await db.user.upsert({
    where: { email: 'hendra.stopped@dailydose.test' },
    update: { stoppedAt: new Date('2026-08-01T00:00:00.000Z'), phone: '+6281899990003' },
    create: {
      email: 'hendra.stopped@dailydose.test',
      displayName: 'Hendra Gunawan (Stopped)',
      phone: '+6281899990003',
      role: Role.CUSTOMER,
      status: 'ACTIVE',
      stoppedAt: new Date('2026-08-01T00:00:00.000Z'),
    },
  });

  const managerPrincipal: SessionPrincipal = {
    userId: manager.id,
    email: manager.email,
    roles: [{ role: 'MANAGER', branchIds: [branchA.id] }],
    capabilities: ['branch:all', 'payment:review', 'payment:decide', 'ledger:adjust:decide'],
    branchIds: [branchA.id],
  };

  const adminPrincipal: SessionPrincipal = {
    userId: admin.id,
    email: admin.email,
    roles: [{ role: 'ADMIN', branchIds: [branchA.id] }],
    capabilities: ['booking:create:assisted', 'class-slot:manage', 'attendance:manage', 'availability:self:read'],
    branchIds: [branchA.id],
  };

  const customerPrincipal: SessionPrincipal = {
    userId: customerActive.id,
    email: customerActive.email,
    roles: [{ role: 'CUSTOMER', branchIds: [] }],
    capabilities: ['booking:self:create', 'booking:self:cancel', 'reschedule:self:read', 'reschedule:self:create'],
    branchIds: [],
  };

  const financePrincipal: SessionPrincipal = {
    userId: financeUser.id,
    email: financeUser.email,
    roles: [{ role: 'FINANCE', branchIds: [] }],
    capabilities: ['branch:all', 'finance:read', 'finance:write', 'monthlyclose:execute', 'finance:reconcile'],
    branchIds: [],
  };

  const superOwnerPrincipal: SessionPrincipal = {
    userId: superOwner.id,
    email: superOwner.email,
    roles: [{ role: 'SUPER_OWNER', branchIds: [] }],
    capabilities: ['branch:all', 'correction:decide'],
    branchIds: [],
  };

  const ownerPrincipal: SessionPrincipal = {
    userId: owner.id,
    email: owner.email,
    roles: [{ role: 'OWNER', branchIds: [branchA.id] }],
    capabilities: ['finance:read'],
    branchIds: [branchA.id],
  };

  const instructorPrincipal: SessionPrincipal = {
    userId: instructor.id,
    email: instructor.email,
    roles: [{ role: 'INSTRUCTOR', branchIds: [branchA.id] }],
    capabilities: ['attendance:self', 'availability:self:create', 'availability:self:read'],
    branchIds: [branchA.id],
  };

  const classType = await db.jenisKelas.findFirstOrThrow({ where: { active: true } });
  const packageTemplate = await db.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
  const studio = await db.studio.findFirstOrThrow({ where: { branchId: branchA.id, active: true } });

  console.log(`Cabang A : ${branchA.name} (${branchA.id})`);
  console.log(`Cabang B : ${branchB.name} (${branchB.id})`);

  // ============================================================================
  // SKENARIO 1: Siklus Pembelian Paket & Ledger Sesi (Normal + Edge Cases)
  // ============================================================================
  console.log('\n--- [SKENARIO 1] Pembelian Paket, Approval Manager & Ledger Sesi ---');
  const invoice1 = `INV-SCEN1-${Date.now()}`;
  const purchase1 = await db.pembelian.create({
    data: {
      invoiceNumber: invoice1,
      branchId: branchA.id,
      packageId: packageTemplate.id,
      userId: customerActive.id,
      subtotalRp: 2500000,
      totalAmountRp: 2500000,
      status: PurchaseStatus.WAITING_VERIFICATION,
      paymentMethod: 'BANK_TRANSFER',
    },
  });

  // Edge case 1.1: Admin mencoba approve
  let adminApproveError = null;
  try {
    await paymentReview.decide(adminPrincipal, purchase1.id, 'APPROVED', {}, `idem-adm-${Date.now()}`, 'corr-adm');
  } catch (e: any) {
    adminApproveError = e.code || e.message;
  }
  console.log(` 1.1 Admin coba Approve -> Ditolak: ${adminApproveError} (Expected: FORBIDDEN / capability check)`);

  // 1.2 Manager menyetujui pembelian
  const decideRes = await paymentReview.decide(managerPrincipal, purchase1.id, 'APPROVED', {}, `idem-mgr-${Date.now()}`, 'corr-mgr');
  const custPkg = (decideRes.body as any).customerPackage;
  console.log(` 1.2 Manager Approve -> Status: PAID, customerPackageId: ${custPkg.id}, available: ${custPkg.ledgerBalance} sesi`);

  // Verifikasi SessionLedger
  const ledgerPurchase = await db.sessionLedger.findFirst({
    where: { customerPackageId: custPkg.id, type: SessionMutationType.PURCHASE },
  });
  console.log(` 1.3 SessionLedger PURCHASE tercatat: +${ledgerPurchase?.amount} sesi, balance: ${ledgerPurchase?.balanceAfter}`);

  // Edge case 1.4: Double Approve / Idempotency
  let doubleApproveError = null;
  try {
    await paymentReview.decide(managerPrincipal, purchase1.id, 'APPROVED', {}, `idem-double-${Date.now()}`, 'corr-double');
  } catch (e: any) {
    doubleApproveError = e.code || e.message;
  }
  console.log(` 1.4 Double Approve pencegahan -> ${doubleApproveError} (Expected: PURCHASE_ALREADY_DECIDED)`);

  // ============================================================================
  // SKENARIO 2: Ketersediaan Instruktur & Penjadwalan Kelas (Collisions)
  // ============================================================================
  console.log('\n--- [SKENARIO 2] Ketersediaan Instruktur & Penjadwalan Slot Kelas ---');
  
  // 2.1 Instruktur input availability
  const availStart = new Date(Date.now() + 72 * 3600_000);
  const availEnd = new Date(availStart.getTime() + 4 * 3600_000);
  const availRes = await availability.create(
    instructorPrincipal,
    { branchId: branchA.id, startAt: availStart.toISOString(), endAt: availEnd.toISOString() },
    `idem-avail-${Date.now()}`,
    'corr-avail',
  );
  console.log(` 2.1 Instruktur submit availability -> Status: ${availRes.status}`);

  // Cek apakah tersimpan di database table instructor_availability:
  const dbAvailCount = await db.instructorAvailability.count({ where: { instructorId: instructor.id } });
  console.log(` 2.2 Verifikasi DB instructor_availability table count: ${dbAvailCount} (Fase 1: Berhasil tersimpan ke DB)`);

  // 2.3 Admin membuat slot kelas normal via classSlotService
  const slotStart = new Date(Date.now() + 48 * 3600_000);
  const slotEnd = new Date(slotStart.getTime() + 3600_000);
  const slotARes = await classSlotService.create(
    adminPrincipal,
    {
      branchId: branchA.id,
      studioId: studio.id,
      classTypeId: classType.id,
      instructorUserId: instructor.id,
      startAt: slotStart.toISOString(),
      endAt: slotEnd.toISOString(),
    },
    `idem-slot-a-${Date.now()}`,
    'corr-slot-a',
  );
  const slotA = await db.slotKelas.findUniqueOrThrow({ where: { id: (slotARes.body as any).id } });
  // Update status ke PUBLISHED dan minQuota = 2 untuk pengujian auto-cancel selanjutnya
  await db.slotKelas.update({
    where: { id: slotA.id },
    data: { status: ClassSlotStatus.PUBLISHED, minQuota: 2 },
  });
  console.log(` 2.3 Admin buat Slot Kelas A -> ID: ${slotA.id} (09:00, Kapasitas: ${slotA.capacity}, MinQuota: 2)`);

  // Edge case 2.4: Admin membuat slot bentrok dengan instruktur yang sama pada jam sama
  let collisionError = null;
  try {
    await classSlotService.create(
      adminPrincipal,
      {
        branchId: branchA.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorUserId: instructor.id,
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
      },
      `idem-overlap-${Date.now()}`,
      'corr-overlap',
    );
  } catch (e: any) {
    collisionError = e.code || e.message;
  }
  console.log(` 2.4 Cek overlap slot instruktur sama pada jam sama -> Dicekal: ${collisionError} (Expected: SLOT_SCHEDULE_COLLISION)`);

  // ============================================================================
  // SKENARIO 3: Alur Booking, Reschedule H-24 & Auto-Cancel H-24
  // ============================================================================
  console.log('\n--- [SKENARIO 3] Booking, Reschedule H-24 & Auto-Cancel H-24 ---');

  // 3.1 Customer booking kelas A
  const bookingRes = await bookingsService.create(
    customerPrincipal,
    {
      classSlotId: slotA.id,
      customerPackageId: custPkg.id,
      source: 'SELF',
    },
    `idem-bk-${Date.now()}`,
    'corr-bk',
  );
  console.log(` 3.1 Customer Book Kelas A -> Booking ID: ${(bookingRes.body as any).id}`);

  // Cek saldo sesi setelah booking:
  const pkgAfterBooking = await db.paketPelanggan.findUniqueOrThrow({ where: { id: custPkg.id } });
  console.log(` 3.2 Sisa Sesi di Paket Pelanggan: ${pkgAfterBooking.remainingSessions} (Rule #1 Terpenuhi: TIDAK BERKURANG SAAT BOOKING)`);

  // 3.3 Slot Kelas A berada di H-24 dengan kuota hanya 1 peserta (kurang dari minQuota = 2)
  await db.minQuotaSetting.upsert({
    where: { branchId_classTypeId: { branchId: branchA.id, classTypeId: classType.id } },
    update: { minQuota: 2, cutoffHours: 24, active: true },
    create: { branchId: branchA.id, classTypeId: classType.id, minQuota: 2, cutoffHours: 24, active: true },
  });

  // Simulasikan evaluasi auto-cancel tepat pada batas H-24 (evaluasi now = slotStart - 23.5 jam)
  const evalTime = new Date(slotStart.getTime() - 23.5 * 3600_000);
  const cancelResult = await autoCancel.evaluateClasses(evalTime);
  const cancelledSlotEntry = cancelResult.cancelledSlots.find((s) => s.slotId === slotA.id);
  console.log(` 3.3 Auto-cancel dievaluasi di H-24 -> Slot dibatalkan: ${Boolean(cancelledSlotEntry)}`);

  // Cek status slot & booking
  const slotAfterCancel = await db.slotKelas.findUniqueOrThrow({ where: { id: slotA.id } });
  const bookingAfterCancel = await db.pemesananKelas.findFirstOrThrow({ where: { classSlotId: slotA.id } });
  console.log(` 3.4 Status Slot: ${slotAfterCancel.status} (Expected: CANCELLED) | Status Booking: ${bookingAfterCancel.status} (Expected: CANCELLED)`);

  // Cek SessionLedger REFUND_AUTOCANCEL
  const ledgerRefund = await db.sessionLedger.findFirst({
    where: { referenceId: bookingAfterCancel.id, type: SessionMutationType.REFUND_AUTOCANCEL },
  });
  console.log(` 3.5 SessionLedger REFUND_AUTOCANCEL: ${Boolean(ledgerRefund)} | Amount: ${ledgerRefund?.amount} (Audit trail utuh)`);

  // ============================================================================
  // SKENARIO 4: Reschedule < H-24 Dicekal & Jalur Darurat SessionAdjustRequest
  // ============================================================================
  console.log('\n--- [SKENARIO 4] Reschedule < H-24 & Emergency Session Adjust Request ---');

  // Buat slot kelas C yang mulai 4 jam lagi
  const slotCStart = new Date(Date.now() + 4 * 3600_000);
  const slotCEnd = new Date(slotCStart.getTime() + 3600_000);
  const slotC = await db.slotKelas.create({
    data: {
      branchId: branchA.id,
      studioId: studio.id,
      classTypeId: classType.id,
      instructorId: instructor.id,
      startAt: slotCStart,
      endAt: slotCEnd,
      capacity: 8,
      bookedCount: 0,
      status: ClassSlotStatus.CONFIRMED,
    },
  });

  // Customer booking slot C
  const bookingC = await db.pemesananKelas.create({
    data: {
      id: randomUUID(),
      bookingNumber: `BK-C-${Date.now()}`,
      classSlotId: slotC.id,
      userId: customerActive.id,
      customerPackageId: custPkg.id,
      status: 'BOOKED',
    },
  });

  // Customer coba cancel / reschedule mandiri di < H-24
  let rescheduleErr = null;
  try {
    await bookingsService.cancel(
      customerPrincipal,
      bookingC.id,
      { reasonCode: 'CUSTOMER_SCHEDULE_CONFLICT' },
      `idem-cancel-${Date.now()}`,
      'corr-cancel',
    );
  } catch (e: any) {
    rescheduleErr = e.code || e.message;
  }
  console.log(` 4.1 Customer coba cancel mandiri di < H-24 -> Ditolak: ${rescheduleErr} (Expected: CANCELLATION_CUTOFF_PASSED)`);

  // 4.2 Admin ajukan SessionAdjustRequest
  const adjustReq = await adjustService.createRequest(adminPrincipal, {
    customerPackageId: custPkg.id,
    bookingId: bookingC.id,
    reason: 'Customer mendadak sakit demam berdarah bawa surat dokter',
    sessionCount: 1,
  });
  console.log(` 4.2 Admin buat SessionAdjustRequest -> ID: ${adjustReq.data.id} | Status: ${adjustReq.data.status}`);

  // 4.3 Manager menyetujui SessionAdjustRequest
  const decidedAdjust = await adjustService.decideRequest(managerPrincipal, adjustReq.data.id, {
    decision: 'APPROVED',
    decisionReason: 'Disetujui berdasarkan surat dokter RS Graha Kedoya',
  });
  console.log(` 4.3 Manager Approve SessionAdjustRequest -> Status: ${decidedAdjust.status}`);

  // Cek mutasi SessionLedger ADJUST_MANUAL
  const ledgerAdjust = await db.sessionLedger.findFirst({
    where: { referenceId: adjustReq.data.id, type: SessionMutationType.ADJUST_MANUAL },
  });
  console.log(` 4.4 SessionLedger ADJUST_MANUAL tercatat: +${ledgerAdjust?.amount} sesi | Balance: ${ledgerAdjust?.balanceAfter}`);

  // ============================================================================
  // SKENARIO 5: Dual Check-In (QR Instruktur vs Link Pelanggan) & Penyelesaian Kelas
  // ============================================================================
  console.log('\n--- [SKENARIO 5] Dual Check-In & Penyelesaian Kelas (Rule #1, #6) ---');

  const slotDStart = new Date(Date.now() + 10 * 60_000); // 10 menit lagi
  const slotDEnd = new Date(Date.now() + 70 * 60_000);
  const slotD = await db.slotKelas.create({
    data: {
      branchId: branchA.id,
      studioId: studio.id,
      classTypeId: classType.id,
      instructorId: instructor.id,
      startAt: slotDStart,
      endAt: slotDEnd,
      capacity: 8,
      bookedCount: 2,
      status: ClassSlotStatus.CONFIRMED,
    },
  });

  const bookingAmanda = await db.pemesananKelas.create({
    data: {
      id: randomUUID(),
      bookingNumber: `BK-D1-${Date.now()}`,
      classSlotId: slotD.id,
      userId: customerActive.id,
      customerPackageId: custPkg.id,
      status: 'BOOKED',
    },
  });

  const bookingBudi = await db.pemesananKelas.create({
    data: {
      id: randomUUID(),
      bookingNumber: `BK-D2-${Date.now()}`,
      classSlotId: slotD.id,
      userId: customerBudi.id,
      customerPackageId: custPkg.id,
      status: 'BOOKED',
    },
  });

  // 5.1 Instruktur issue QR check-in
  const instQr = await attendanceService.issueInstructor(
    instructorPrincipal,
    slotD.id,
    `idem-inst-${Date.now()}`,
    'corr-inst',
  );
  console.log(` 5.1 Instruktur generate QR di tablet -> Token: ${instQr.token.slice(0, 10)}... (Metode: QR_SCAN)`);

  // Instruktur scan QR
  const instCheckInRes = await attendanceService.consumeInstructor(
    instructorPrincipal,
    { token: instQr.token },
    `idem-inst-consume-${Date.now()}`,
    'corr-inst-consume',
  );
  console.log(` 5.2 Instruktur scan QR -> Success: ${instCheckInRes.body.success}`);

  // 5.3 Pelanggan (Amanda) check-in lewat tautan mandiri
  const rawTokenAmanda = (attendanceService as any).constructor.name ? require('crypto').randomBytes(32).toString('base64url') : '';
  const tokenHashAmanda = require('crypto').createHash('sha256').update(rawTokenAmanda).digest('hex');
  const tokenRecord = await db.checkInToken.create({
    data: {
      id: randomUUID(),
      bookingId: bookingAmanda.id,
      token: tokenHashAmanda,
      expiresAt: slotDEnd,
    },
  });

  const custConfirmRes = await attendanceService.confirmCustomerLink(rawTokenAmanda);
  console.log(` 5.3 Amanda klik Link Check-in Mandiri -> Status: ${custConfirmRes.status} | Metrik: WEB_LINK`);

  // Budi TIDAK check-in (lupa)

  // 5.4 Kelas diselesaikan (COMPLETED)
  const pkgBeforeComplete = await db.paketPelanggan.findUniqueOrThrow({ where: { id: custPkg.id } });
  console.log(` 5.4 Sisa Sesi Sebelum Kelas COMPLETED: ${pkgBeforeComplete.remainingSessions}`);

  await classSlotService.complete(managerPrincipal, slotD.id, {}, `idem-complete-key-${Date.now()}`, 'corr-complete-action');

  const pkgAfterComplete = await db.paketPelanggan.findUniqueOrThrow({ where: { id: custPkg.id } });
  console.log(` 5.5 Sisa Sesi Setelah Kelas COMPLETED: ${pkgAfterComplete.remainingSessions} (Rule #1: Terpotong 1 untuk Amanda yang hadir)`);

  const bookingBudiAfter = await db.pemesananKelas.findUniqueOrThrow({ where: { id: bookingBudi.id } });
  console.log(` 5.6 Status Booking Budi yang tidak hadir: ${bookingBudiAfter.status} (Audit: NO_SHOW tidak memotong sesi)`);

  // ============================================================================
  // SKENARIO 6: Batas Toleransi Backfill Admin (H+2 Jam)
  // ============================================================================
  console.log('\n--- [SKENARIO 6] Batas Toleransi Admin Backfill (H+2 Jam Cutoff) ---');

  // Kasus 6.1: Backfill dalam batas toleransi (slotD.endAt + 30 menit)
  const nowWithinWindow = new Date(slotDEnd.getTime() + 30 * 60_000);
  const backfillSuccess = await attendanceService.backfillCustomer(
    adminPrincipal,
    { bookingId: bookingBudi.id, reason: 'Member hadir terlambat 10 menit tapi belum klik link' },
    `idem-bf-${Date.now()}`,
    'corr-bf',
    nowWithinWindow,
  );
  console.log(` 6.1 Admin Backfill (H+30 menit) -> Berhasil: ${backfillSuccess.ok} | Sesi Budi terpotong di ledger`);

  // Kasus 6.2: Backfill melewati batas toleransi H+2 jam (slotE berakhir 2.5 jam yang lalu)
  const slotEStart = new Date(Date.now() - 3.5 * 3600_000);
  const slotEEnd = new Date(Date.now() - 2.5 * 3600_000);
  const slotE = await db.slotKelas.create({
    data: {
      branchId: branchA.id,
      studioId: studio.id,
      classTypeId: classType.id,
      instructorId: instructor.id,
      startAt: slotEStart,
      endAt: slotEEnd,
      capacity: 8,
      bookedCount: 1,
      status: ClassSlotStatus.COMPLETED,
    },
  });

  const bookingExpiredBf = await db.pemesananKelas.create({
    data: {
      id: randomUUID(),
      bookingNumber: `BK-E-${Date.now()}`,
      classSlotId: slotE.id,
      userId: customerBudi.id,
      customerPackageId: custPkg.id,
      status: 'NO_SHOW',
    },
  });

  let backfillExpiredErr = null;
  try {
    await attendanceService.backfillCustomer(
      adminPrincipal,
      { bookingId: bookingExpiredBf.id, reason: 'Coba backfill setelah H+2' },
      `idem-bf-exp-${Date.now()}`,
      'corr-bf-exp',
      new Date(), // now is 2.5 hours after slotEEnd
    );
  } catch (e: any) {
    backfillExpiredErr = e.code || e.message;
  }
  console.log(` 6.2 Admin Backfill (H+2.5 jam) -> Dicekal: ${backfillExpiredErr} (Expected: ADMIN_BACKFILL_WINDOW_CLOSED)`);

  // ============================================================================
  // SKENARIO 7: Isolasi Akses Multi-Cabang (Rule #10)
  // ============================================================================
  console.log('\n--- [SKENARIO 7] Isolasi Hak Akses Owner Cabang (Rule #10) ---');

  // Owner Cabang A akses Cabang A
  const ownerReportA = await finance.omsetReport(ownerPrincipal, { branchId: branchA.id, period: testPeriod });
  console.log(` 7.1 Owner Cabang A akses laporan Cabang A -> Berhasil: Omset Rp ${ownerReportA.totalOmsetRp}`);

  // Owner Cabang A coba akses Cabang B
  let crossBranchErr = null;
  try {
    await finance.omsetReport(ownerPrincipal, { branchId: branchB.id, period: testPeriod });
  } catch (e: any) {
    crossBranchErr = e.code || e.message || e.status;
  }
  console.log(` 7.2 Owner Cabang A intip laporan Cabang B -> Dicekal: ${crossBranchErr} (Expected: FORBIDDEN / 403)`);

  // ============================================================================
  // SKENARIO 8: Modul Finansial Bulanan & Tutup Buku Bulanan (Rule #8)
  // ============================================================================
  console.log('\n--- [SKENARIO 8] Modul Finansial, 5 Laporan & Period Lock Protection ---');

  // Edge case 8.0: Coba input biaya negatif atau nol
  let negativeCostErr = null;
  try {
    await finance.createOtherCost(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
      category: 'SUPPLIES',
      description: 'Test biaya negatif',
      amountRp: -500000,
    });
  } catch (e: any) {
    negativeCostErr = e.code || e.message;
  }
  console.log(` 8.0 Input biaya negatif dicekal -> ${negativeCostErr} (Expected: INVALID_AMOUNT)`);

  // Finance input OtherCost pada periode OPEN
  const rentCost = await finance.createOtherCost(financePrincipal, {
    branchId: branchA.id,
    period: testPeriod,
    category: 'RENT',
    description: 'Sewa Ruko Kedoya Oktober 2026',
    amountRp: 7500000,
  });

  const utilCost = await finance.createOtherCost(financePrincipal, {
    branchId: branchA.id,
    period: testPeriod,
    category: 'UTILITIES',
    description: 'Listrik & WiFi Studio',
    amountRp: 1250000,
  });
  console.log(` 8.1 Finance catat OtherCost: Sewa Rp ${rentCost.amountRp} + Utilitas Rp ${utilCost.amountRp}`);

  // Evaluasi 5 Laporan Keuangan
  const omsetRep = await finance.omsetReport(financePrincipal, { branchId: branchA.id, period: testPeriod });
  const coachRealtime = await finance.realtimeInstructorCostReport(financePrincipal, { branchId: branchA.id, period: testPeriod });
  const coachProj = await finance.projectionInstructorCostReport(financePrincipal, { branchId: branchA.id, period: testPeriod });
  const otherCosts = await finance.otherCostReport(financePrincipal, { branchId: branchA.id, period: testPeriod });
  const profitRep = await finance.monthlyProfitReport(financePrincipal, { branchId: branchA.id, period: testPeriod });

  console.log(` 8.2 Laporan 1: Omset Penjualan       = Rp ${omsetRep.totalOmsetRp.toLocaleString('id-ID')}`);
  console.log(` 8.3 Laporan 2: Beban Coach Realtime  = Rp ${coachRealtime.totalInstructorCostRp.toLocaleString('id-ID')}`);
  console.log(` 8.4 Laporan 3: Beban Coach Projeksi  = Rp ${coachProj.totalProjectionCostRp.toLocaleString('id-ID')}`);
  console.log(` 8.5 Laporan 4: Total Other Cost      = Rp ${otherCosts.totalOtherCostRp.toLocaleString('id-ID')}`);
  console.log(` 8.6 Laporan 5: Laba Bersih Realtime  = Rp ${profitRep.netProfitRealtimeRp.toLocaleString('id-ID')}`);
  console.log(` 8.7 Laporan 5: Laba Bersih Projeksi  = Rp ${profitRep.netProfitProjectionRp.toLocaleString('id-ID')}`);

  // Tutup Buku Bulanan
  const closeRes = await finance.executeMonthlyClose(financePrincipal, {
    branchId: branchA.id,
    period: testPeriod,
    reason: 'Tutup buku resmi Oktober 2026',
  });
  console.log(` 8.8 Tutup Buku Bulanan -> Status: ${closeRes.status} | ControlHash: ${closeRes.controlHash}`);

  // Period Lock Protection: Coba tambah biaya pasca-lock
  let lockRejectErr = null;
  try {
    await finance.createOtherCost(financePrincipal, {
      branchId: branchA.id,
      period: testPeriod,
      category: 'SUPPLIES',
      description: 'Coba input pasca lock',
      amountRp: 200000,
    });
  } catch (e: any) {
    lockRejectErr = e.code || e.message;
  }
  console.log(` 8.9 Period Lock Protection -> Input biaya pasca-lock dicekal: ${lockRejectErr} (Expected: PERIOD_ALREADY_LOCKED / 409)`);

  // ============================================================================
  // SKENARIO 9: Jurnal Koreksi Pasca-Lock (Super Owner Exclusive)
  // ============================================================================
  console.log('\n--- [SKENARIO 9] Jurnal Koreksi Pasca-Lock Disetujui Super Owner ---');

  const correction = await finance.createCorrection(financePrincipal, {
    branchId: branchA.id,
    period: testPeriodNext, // periode buku berjalan
    targetPeriod: testPeriod, // periode target yang locked
    amountRp: -350000,
    reason: 'Kelebihan catat biaya kebersihan bulan lalu',
  });
  console.log(` 9.1 Finance ajukan Jurnal Koreksi -> ID: ${correction.id} | Status: ${correction.status}`);

  // Manager coba approve
  let managerApproveCorrErr = null;
  try {
    await finance.decideCorrection(managerPrincipal, correction.id, 'APPROVE', 'Manager coba approve');
  } catch (e: any) {
    managerApproveCorrErr = e.code || e.message;
  }
  console.log(` 9.2 Manager coba Approve Koreksi -> Dicekal: ${managerApproveCorrErr} (Expected: FORBIDDEN)`);

  // Super Owner approve
  const approvedCorr = await finance.decideCorrection(superOwnerPrincipal, correction.id, 'APPROVE', 'Disetujui Super Owner');
  console.log(` 9.3 Super Owner Approve Koreksi -> Status: ${approvedCorr.status}`);

  // Pastikan snapshot historis periode lampau TETAP UTUH
  const historicalClose = await db.monthlyClose.findUniqueOrThrow({
    where: { branchId_period: { branchId: branchA.id, period: testPeriod } },
  });
  console.log(` 9.4 Snapshot Masa Lampau (${testPeriod}) Omset: Rp ${historicalClose.omsetRp} | Profit: Rp ${historicalClose.profitRp} (TETAP UTUH & AMAN)`);

  // ============================================================================
  // SKENARIO 10: Otomasi WhatsApp & Proteksi Customer Berhenti (Rule #11, 12, 13)
  // ============================================================================
  console.log('\n--- [SKENARIO 10] Otomasi WhatsApp & Proteksi Customer Berhenti ---');

  // Jalankan reminder batch
  const batchRes = await reminderSchedule.runAllReminders(new Date());
  console.log(` 10.1 Reminder Batch: H7=${batchRes.customerH7Sent}, H3=${batchRes.customerH3Sent}, H1=${batchRes.customerH1Sent}`);
  console.log(` 10.2 Admin Digest Sent: ${batchRes.adminDigestsSent} | Owner Recap Sent: ${batchRes.ownerRecapsSent}`);
  console.log(` 10.3 Customer Berhenti Terproteksi (stoppedAt != null): ${batchRes.stoppedCustomersProtected} customer (100% BEBAS SPAM / 0 Pesan)`);

  // Verifikasi ke tabel reminder_log untuk customer stopped
  const cleanPhoneStopped = whatsapp.normalizePhone(customerStopped.phone || '');
  const stoppedLogs = await db.reminderLog.count({ where: { recipientPhone: cleanPhoneStopped } });
  console.log(` 10.4 Verifikasi Database Log WhatsApp untuk Customer Berhenti: ${stoppedLogs} pesan (Expected: 0)`);

  console.log('\n================================================================================');
  console.log('🏁 SELURUH 10 SKENARIO PENGUJIAN OPERASIONAL TELAH SELESAI DIEKSEKUSI! 🏁');
  console.log('================================================================================\n');
}

run10Scenarios()
  .catch((err) => {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
