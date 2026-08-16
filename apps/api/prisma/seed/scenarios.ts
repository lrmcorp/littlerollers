import type {
  ClassSlotStatus,
  PurchaseStatus,
  PurchaseTimelineEventType,
  RescheduleStatus,
  SessionAdjustmentStatus,
} from '@prisma/client';
import { createHash } from 'node:crypto';
import type { SeedContext } from './context';
import type { SeedMasterResult } from './master-data';
import { ensurePrivatePngFixture } from './private-fixture';

async function seedPurchaseTimeline(
  ctx: SeedContext,
  purchaseId: string,
  events: Array<{
    key: string;
    type: PurchaseTimelineEventType;
    occurredAt: Date;
    reasonCode?: string | null;
    derived?: boolean;
  }>,
) {
  await ctx.db.purchaseTimelineEvent.deleteMany({ where: { purchaseId, derived: true } });
  for (const event of events) {
    const sourceKey = `${purchaseId}:seed:${event.key}`;
    await ctx.db.purchaseTimelineEvent.upsert({
      where: { sourceKey },
      update: {
        eventType: event.type,
        occurredAt: event.occurredAt,
        reasonCode: event.reasonCode ?? null,
        derived: event.derived ?? false,
      },
      create: {
        id: ctx.id('purchase-timeline', sourceKey),
        purchaseId,
        eventType: event.type,
        sourceKey,
        occurredAt: event.occurredAt,
        reasonCode: event.reasonCode,
        derived: event.derived,
      },
    });
  }
}

export function bsdQuotaJobFixture(
  ctx: SeedContext,
  key: 'risk' | 'completed',
  status: 'FAILED' | 'SUCCEEDED',
) {
  const dueAt = ctx.at(key === 'risk' ? 0 : -3);
  return {
    dueAt,
    nextAttemptAt: status === 'FAILED' ? ctx.at(0, 1) : dueAt,
    attempts: status === 'FAILED' ? 3 : 1,
    lastErrorCode: status === 'FAILED' ? 'SEED_BSD_PROVIDER_TIMEOUT' : null,
  };
}

export async function seedOperationalScenarios(ctx: SeedContext, master: SeedMasterResult, users: Record<string, string>) {
  const customerId = users.customer!; const financeId = users.finance!; const managerId = users.manager!; const instructorId = users.instructor!;
  const branchId = master.branches['DD-JKT']!; const studioId = master.studios['DD-JKT']!; const classTypeId = master.classTypes['DD-JKT:REFORMER']!; const packageId = master.packages['DD-JKT:REFORMER:10']!;
  const pkg = await ctx.db.package.findUniqueOrThrow({ where: { id: packageId } });
  const paymentAccount = await ctx.db.paymentAccount.findFirstOrThrow({
    where: { branchId, active: true },
  });
  const statuses: { key: string; status: ClassSlotStatus; day: number; booked: number; cancellation?: 'INSTRUCTOR_UNAVAILABLE' }[] = [
    { key: 'draft', status: 'DRAFT', day: 1, booked: 0 }, { key: 'risk', status: 'PUBLISHED', day: 1, booked: 1 },
    { key: 'published', status: 'PUBLISHED', day: 2, booked: 2 }, { key: 'confirmed', status: 'CONFIRMED', day: 3, booked: 3 },
    { key: 'completed', status: 'COMPLETED', day: -2, booked: 2 }, { key: 'cancelled', status: 'CANCELLED', day: -1, booked: 0, cancellation: 'INSTRUCTOR_UNAVAILABLE' },
  ];
  const slots: Record<string, string> = {};
  for (const item of statuses) {
    const id = ctx.id('class-slot', item.key); slots[item.key] = id;
    await ctx.db.classSlot.upsert({ where: { id }, update: { status: item.status, bookedCount: item.booked }, create: { id, branchId, studioId, classTypeId, instructorUserId: instructorId, startAt: ctx.at(item.day, 7), endAt: ctx.at(item.day, 8), timezone: 'Asia/Jakarta', minimumQuota: 3, capacity: 10, bookedCount: item.booked, status: item.status, cancellationReasonCode: item.cancellation } });
  }
  const purchaseStatuses: PurchaseStatus[] = ['AWAITING_PAYMENT', 'PENDING', 'ACTION_REQUIRED', 'APPROVED', 'REJECTED', 'EXPIRED'];
  const purchases: Record<string, string> = {};
  for (const [index, status] of purchaseStatuses.entries()) {
    const key = status.toLowerCase(); const id = ctx.id('purchase', key); purchases[key] = id;
    const hasProof = status !== 'AWAITING_PAYMENT' && status !== 'EXPIRED'; const proofId = hasProof ? ctx.id('payment-proof', key) : null;
    if (proofId) {
      const objectKey = `seed/proofs/${key}`;
      const file = await ensurePrivatePngFixture(objectKey);
      await ctx.db.paymentProof.upsert({ where: { id: proofId }, update: { objectKey, checksum: file.checksum, mimeType: file.mimeType, sizeBytes: file.sizeBytes, uploadStatus: 'FINALIZED', scanStatus: 'CLEAN' }, create: { id: proofId, userId: customerId, branchId, packageId, objectKey, checksum: file.checksum, fileName: `${key}.png`, mimeType: file.mimeType, sizeBytes: file.sizeBytes, uploadStatus: 'FINALIZED', scanStatus: 'CLEAN', finalizedAt: ctx.at(-index) } });
    }
    const code = 101 + index;
    const expiresAt = status === 'EXPIRED' ? ctx.at(-1) : ctx.at(1);
    await ctx.db.purchase.upsert({ where: { id }, update: { classTypeId, status, paymentProofId: proofId, paymentUniqueCode: code, payableAmountRpSnapshot: pkg.priceRp + code, paymentAccountId: paymentAccount.id, paymentExpiresAt: expiresAt, timelineComplete: status !== 'EXPIRED' }, create: { id, userId: customerId, branchId, packageId, classTypeId, paymentProofId: proofId, paymentAccountId: paymentAccount.id, paymentBankNameSnapshot: paymentAccount.bankName, paymentAccountNumberSnapshotEncrypted: paymentAccount.accountNumberEncrypted, paymentAccountLast4Snapshot: paymentAccount.accountNumberLast4, paymentAccountHolderSnapshot: paymentAccount.accountHolderName, paymentExpiresAt: expiresAt, packageNameSnapshot: pkg.name, priceRpSnapshot: pkg.priceRp, paymentUniqueCode: code, payableAmountRpSnapshot: pkg.priceRp + code, sessionCountSnapshot: pkg.sessionCount, durationDaysSnapshot: pkg.durationDays, status, timelineComplete: status !== 'EXPIRED', idempotencyKeyHash: `seed-${key}`, submittedAt: ctx.at(-index), decidedAt: ['APPROVED', 'REJECTED', 'ACTION_REQUIRED'].includes(status) ? ctx.at(-index, 1) : null, decidedById: ['APPROVED', 'REJECTED', 'ACTION_REQUIRED'].includes(status) ? financeId : null, decisionReasonCode: status === 'APPROVED' ? 'PAYMENT_VERIFIED' : status === 'REJECTED' ? 'DUPLICATE_PURCHASE' : status === 'ACTION_REQUIRED' ? 'PROOF_INVALID' : null } });
    const decisionType =
      status === 'APPROVED'
        ? 'PAYMENT_APPROVED'
        : status === 'ACTION_REQUIRED'
          ? 'ACTION_REQUIRED'
          : status === 'REJECTED'
            ? 'PAYMENT_REJECTED'
            : null;
    await seedPurchaseTimeline(ctx, id, [
      { key: 'created', type: 'ORDER_CREATED', occurredAt: ctx.at(-index), derived: status === 'EXPIRED' },
      { key: 'deadline', type: 'PAYMENT_DEADLINE_SET', occurredAt: ctx.at(-index), derived: status === 'EXPIRED' },
      ...(proofId
        ? [
            { key: 'proof', type: 'PROOF_SUBMITTED' as const, occurredAt: ctx.at(-index) },
            { key: 'scan', type: 'PROOF_SCAN_COMPLETED' as const, occurredAt: ctx.at(-index) },
          ]
        : []),
      ...(decisionType
        ? [
            {
              key: 'decision',
              type: decisionType as PurchaseTimelineEventType,
              occurredAt: ctx.at(-index, 1),
              reasonCode:
                status === 'APPROVED'
                  ? 'PAYMENT_VERIFIED'
                  : status === 'REJECTED'
                    ? 'DUPLICATE_PURCHASE'
                    : 'PROOF_INVALID',
            },
          ]
        : []),
      ...(status === 'EXPIRED'
        ? [{ key: 'expired', type: 'ORDER_EXPIRED' as const, occurredAt: expiresAt, derived: true }]
        : []),
    ]);
    if (['AWAITING_PAYMENT', 'PENDING', 'ACTION_REQUIRED'].includes(status)) {
      await ctx.db.paymentUniqueCodeReservation.upsert({
        where: { purchaseId: id },
        update: { paymentAccountId: paymentAccount.id, code, expiresAt },
        create: { id: ctx.id('payment-code-reservation', key), paymentAccountId: paymentAccount.id, purchaseId: id, code, expiresAt },
      });
    } else {
      await ctx.db.paymentUniqueCodeReservation.deleteMany({ where: { purchaseId: id } });
    }
  }
  const customerPackageId = ctx.id('customer-package', 'approved');
  await ctx.db.customerPackage.upsert({ where: { purchaseId: purchases.approved! }, update: { status: 'ACTIVE' }, create: { id: customerPackageId, purchaseId: purchases.approved!, customerUserId: customerId, branchId, packageId, classTypeId, activationDate: ctx.anchor, expiryAt: ctx.at(90), salePriceRp: pkg.priceRp, sessionCountSnapshot: pkg.sessionCount, durationDaysSnapshot: pkg.durationDays, projectionRateRp: 175_000 } });
  await seedPurchaseTimeline(ctx, purchases.approved!, [
    { key: 'activated', type: 'PACKAGE_ACTIVATED', occurredAt: ctx.anchor },
  ]);
  await ctx.db.ledgerEntry.upsert({ where: { type_referenceType_referenceId: { type: 'PURCHASE', referenceType: 'PURCHASE', referenceId: purchases.approved! } }, update: { quantity: pkg.sessionCount }, create: { id: ctx.id('ledger', 'purchase'), customerPackageId, type: 'PURCHASE', quantity: pkg.sessionCount, referenceType: 'PURCHASE', referenceId: purchases.approved! } });
  const bookingStates = [
    { key: 'active', status: 'BOOKED' as const, slot: 'published' },
    { key: 'checkin', status: 'BOOKED' as const, slot: 'confirmed' },
    { key: 'attended', status: 'ATTENDED' as const, slot: 'completed' },
    { key: 'cancelled', status: 'CANCELLED' as const, slot: 'confirmed' },
  ];
  const bookings: Record<string, string> = {};
  for (const item of bookingStates) {
    const reservationId = ctx.id('reservation', item.key); const bookingId = ctx.id('booking', item.key); bookings[item.key] = bookingId;
    const reservationStatus = item.status === 'ATTENDED' ? 'CONSUMED' as const : item.status === 'CANCELLED' ? 'RELEASED' as const : 'ACTIVE' as const;
    const consumedAt = reservationStatus === 'CONSUMED' ? ctx.anchor : null;
    const releasedAt = reservationStatus === 'RELEASED' ? ctx.anchor : null;
    await ctx.db.sessionReservation.upsert({ where: { customerPackageId_referenceHash: { customerPackageId, referenceHash: `seed-${item.key}` } }, update: { status: reservationStatus, consumedAt, releasedAt }, create: { id: reservationId, customerPackageId, classSlotId: slots[item.slot], referenceHash: `seed-${item.key}`, quantity: 1, status: reservationStatus, consumedAt, releasedAt } });
    await ctx.db.booking.upsert({ where: { id: bookingId }, update: { status: item.status }, create: { id: bookingId, branchId, classSlotId: slots[item.slot]!, customerUserId: customerId, customerPackageId, reservationId, createdById: managerId, source: 'ADMIN_ASSISTED', status: item.status } });
  }
  const tokenHash = (key: string) =>
    createHash('sha256').update(ctx.id('check-in-token-material', key)).digest('hex');
  const tokenFixtures = [
    {
      key: 'active',
      booking: 'checkin',
      status: 'ACTIVE' as const,
      notBeforeAt: ctx.at(3, 6.5),
      expiresAt: ctx.at(3, 8),
      activeBookingKey: bookings.checkin!,
    },
    {
      key: 'used',
      booking: 'attended',
      status: 'USED' as const,
      notBeforeAt: ctx.at(-2, 6.5),
      expiresAt: ctx.at(-2, 8),
      usedAt: ctx.at(-2, 7 + 5 / 60),
    },
    {
      key: 'revoked',
      booking: 'cancelled',
      status: 'REVOKED' as const,
      notBeforeAt: ctx.at(3, 6.5),
      expiresAt: ctx.at(3, 8),
      revokedAt: ctx.anchor,
    },
    {
      key: 'expired',
      booking: 'active',
      status: 'ACTIVE' as const,
      notBeforeAt: ctx.at(-2, 6.5),
      expiresAt: ctx.at(-2, 8),
    },
  ];
  await ctx.db.checkInToken.updateMany({
    where: { bookingId: bookings.checkin!, status: 'ACTIVE' },
    data: {
      status: 'REVOKED',
      activeBookingKey: null,
      revokedAt: ctx.anchor,
      version: { increment: 1 },
    },
  });
  for (const fixture of tokenFixtures) {
    const id = ctx.id('check-in-token', fixture.key);
    await ctx.db.checkInToken.upsert({
      where: { id },
      update: {
        bookingId: bookings[fixture.booking]!,
        issuedById: managerId,
        tokenHash: tokenHash(fixture.key),
        activeBookingKey: fixture.activeBookingKey ?? null,
        notBeforeAt: fixture.notBeforeAt,
        expiresAt: fixture.expiresAt,
        status: fixture.status,
        usedAt: fixture.usedAt ?? null,
        revokedAt: fixture.revokedAt ?? null,
      },
      create: {
        id,
        bookingId: bookings[fixture.booking]!,
        issuedById: managerId,
        tokenHash: tokenHash(fixture.key),
        activeBookingKey: fixture.activeBookingKey,
        idempotencyKeyHash: tokenHash(`idempotency-${fixture.key}`),
        requestHash: tokenHash(`request-${fixture.key}`),
        notBeforeAt: fixture.notBeforeAt,
        expiresAt: fixture.expiresAt,
        status: fixture.status,
        usedAt: fixture.usedAt,
        revokedAt: fixture.revokedAt,
      },
    });
  }
  const usedAuditLogId = ctx.id('audit', 'check-in-used');
  await ctx.db.auditLog.upsert({
    where: { id: usedAuditLogId },
    update: {},
    create: {
      id: usedAuditLogId,
      occurredAt: ctx.at(-2, 7 + 5 / 60),
      actorType: 'USER',
      actorId: managerId,
      branchId,
      targetUserId: customerId,
      action: 'attendance.customer_checked_in',
      objectType: 'CustomerAttendance',
      objectId: ctx.id('attendance', 'used'),
      correlationId: 'seed-check-in-used',
      afterMasked: { bookingId: bookings.attended!, source: 'QR' },
    },
  });
  await ctx.db.customerAttendance.upsert({
    where: { bookingId: bookings.attended! },
    update: {
      tokenId: ctx.id('check-in-token', 'used'),
      checkedInAt: ctx.at(-2, 7 + 5 / 60),
      recordedById: managerId,
      auditLogId: usedAuditLogId,
    },
    create: {
      id: ctx.id('attendance', 'used'),
      bookingId: bookings.attended!,
      tokenId: ctx.id('check-in-token', 'used'),
      branchId,
      classSlotId: slots.completed!,
      recordedById: managerId,
      checkedInAt: ctx.at(-2, 7 + 5 / 60),
      auditLogId: usedAuditLogId,
    },
  });
  const reschedules: { key: string; status: RescheduleStatus }[] = [{ key: 'pending', status: 'PENDING' }, { key: 'approved', status: 'APPROVED' }, { key: 'rejected', status: 'REJECTED' }];
  for (const [index, item] of reschedules.entries()) await ctx.db.reschedule.upsert({ where: { id: ctx.id('reschedule', item.key) }, update: { status: item.status }, create: { id: ctx.id('reschedule', item.key), branchId, bookingId: bookings.active!, sourceClassSlotId: slots.published!, targetClassSlotId: slots.confirmed!, requestedById: customerId, decidedById: item.status === 'PENDING' ? null : managerId, requestReasonCode: 'CUSTOMER_SCHEDULE_CONFLICT', decisionReasonCode: item.status === 'APPROVED' ? 'ELIGIBILITY_VERIFIED' : item.status === 'REJECTED' ? 'TARGET_UNAVAILABLE' : null, status: item.status, entitlementCutoffAt: ctx.at(1), entitledAtRequest: true, requestedAt: ctx.at(-index), decidedAt: item.status === 'PENDING' ? null : ctx.at(-index, 1) } });
  const adjustments: { key: string; status: SessionAdjustmentStatus; quantity: number }[] = [{ key: 'pending', status: 'PENDING', quantity: 1 }, { key: 'posted', status: 'POSTED', quantity: 1 }, { key: 'rejected', status: 'REJECTED', quantity: -1 }];
  for (const item of adjustments) {
    const adjustmentId = ctx.id('adjustment', item.key);
    await ctx.db.sessionAdjustment.upsert({ where: { id: adjustmentId }, update: { status: item.status }, create: { id: adjustmentId, customerPackageId, quantity: item.quantity, reasonCode: 'SUPPORT_RECONCILIATION', requestedById: managerId, decidedById: item.status === 'PENDING' ? null : financeId, decisionCode: item.status === 'POSTED' ? 'CORRECTION_VERIFIED' : item.status === 'REJECTED' ? 'INVALID_EVIDENCE' : null, status: item.status, decidedAt: item.status === 'PENDING' ? null : ctx.anchor } });
    if (item.status === 'POSTED') await ctx.db.ledgerEntry.upsert({ where: { sessionAdjustmentId: adjustmentId }, update: { quantity: item.quantity }, create: { id: ctx.id('ledger', `adjustment-${item.key}`), customerPackageId, type: 'ADJUST_MANUAL', quantity: item.quantity, referenceType: 'SESSION_ADJUSTMENT', referenceId: adjustmentId, sessionAdjustmentId: adjustmentId } });
  }
  const jobStates = ['QUEUED', 'RETRYING', 'FAILED', 'SUCCEEDED'] as const;
  for (const [index, status] of jobStates.entries()) {
    const slotId = [slots.draft, slots.risk, slots.confirmed, slots.completed][index]!;
    await ctx.db.quotaEvaluationJob.upsert({ where: { classSlotId: slotId }, update: { status }, create: { id: ctx.id('quota-job', status), classSlotId: slotId, evaluationKey: `seed-${status.toLowerCase()}`, dueAt: ctx.at(index - 1), status, attempts: index, maxAttempts: 5, nextAttemptAt: ctx.at(index - 1, 1), lastErrorCode: status === 'FAILED' ? 'SEED_PROVIDER_TIMEOUT' : null } });
  }
  for (let index = 0; index < 12; index++) await ctx.db.auditLog.upsert({ where: { id: ctx.id('audit', index) }, update: {}, create: { id: ctx.id('audit', index), occurredAt: ctx.at(-index), actorType: index % 3 ? 'USER' : 'SYSTEM', actorId: index % 3 ? managerId : null, branchId, action: `SEED_ACTIVITY_${index + 1}`, objectType: index % 2 ? 'Purchase' : 'ClassSlot', objectId: index % 2 ? purchases.pending! : slots.published!, correlationId: `seed-correlation-${index}` } });
  await seedBsdOperationalScenarios(ctx, master, users);
}

async function seedBsdOperationalScenarios(
  ctx: SeedContext,
  master: SeedMasterResult,
  users: Record<string, string>,
) {
  const branchId = master.branches['DD-BSD']!;
  const classTypeId = master.classTypes['DD-BSD:REFORMER']!;
  const packageId = master.packages['DD-BSD:REFORMER:10']!;
  const studioId = master.studios['DD-BSD']!;
  const customerId = users.customer!;
  const managerId = users['manager-bsd']!;
  const financeId = users.finance!;
  const instructorId = users['instructor-bsd-2']!;
  if (!managerId || !instructorId) throw new Error('BSD operational scenarios require manager and instructor fixtures.');
  const pkg = await ctx.db.package.findUniqueOrThrow({ where: { id: packageId } });
  const paymentAccount = await ctx.db.paymentAccount.findFirstOrThrow({
    where: { branchId, active: true },
  });
  const slots = [
    { key: 'risk', status: 'PUBLISHED' as const, day: 1, bookedCount: 1 },
    { key: 'published', status: 'PUBLISHED' as const, day: 2, bookedCount: 2 },
    { key: 'confirmed', status: 'CONFIRMED' as const, day: 3, bookedCount: 4 },
    { key: 'completed', status: 'COMPLETED' as const, day: -3, bookedCount: 5 },
  ];
  const slotIds: Record<string, string> = {};
  for (const slot of slots) {
    const id = ctx.id('class-slot', `bsd-${slot.key}`);
    slotIds[slot.key] = id;
    await ctx.db.classSlot.upsert({
      where: { id },
      update: { status: slot.status, bookedCount: slot.bookedCount },
      create: {
        id,
        branchId,
        studioId,
        classTypeId,
        instructorUserId: instructorId,
        startAt: ctx.at(slot.day, 10),
        endAt: ctx.at(slot.day, 11),
        timezone: 'Asia/Jakarta',
        minimumQuota: 3,
        capacity: 12,
        bookedCount: slot.bookedCount,
        status: slot.status,
      },
    });
  }

  const approvedPurchaseId = ctx.id('purchase', 'bsd-approved');
  const approvedProofId = ctx.id('payment-proof', 'bsd-approved');
  const bsdApprovedProof = await ensurePrivatePngFixture('seed/proofs/bsd-approved');
  await ctx.db.paymentProof.upsert({
    where: { id: approvedProofId },
    update: {
      checksum: bsdApprovedProof.checksum,
      mimeType: bsdApprovedProof.mimeType,
      sizeBytes: bsdApprovedProof.sizeBytes,
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      finalizedAt: ctx.at(-2, 0.75),
    },
    create: {
      id: approvedProofId,
      userId: customerId,
      branchId,
      packageId,
      objectKey: 'seed/proofs/bsd-approved',
      checksum: bsdApprovedProof.checksum,
      fileName: 'bsd-approved.png',
      mimeType: 'image/png',
      sizeBytes: bsdApprovedProof.sizeBytes,
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      finalizedAt: ctx.at(-2, 0.75),
    },
  });
  await ctx.db.purchase.upsert({
    where: { id: approvedPurchaseId },
    update: {
      classTypeId,
      status: 'APPROVED',
      paymentProofId: approvedProofId,
      paymentAccountId: paymentAccount.id,
      paymentUniqueCode: 400,
      payableAmountRpSnapshot: pkg.priceRp + 400,
      timelineComplete: true,
    },
    create: {
      id: approvedPurchaseId,
      userId: customerId,
      branchId,
      packageId,
      classTypeId,
      paymentProofId: approvedProofId,
      paymentAccountId: paymentAccount.id,
      paymentBankNameSnapshot: paymentAccount.bankName,
      paymentAccountNumberSnapshotEncrypted: paymentAccount.accountNumberEncrypted,
      paymentAccountLast4Snapshot: paymentAccount.accountNumberLast4,
      paymentAccountHolderSnapshot: paymentAccount.accountHolderName,
      paymentExpiresAt: ctx.at(-1),
      packageNameSnapshot: pkg.name,
      priceRpSnapshot: pkg.priceRp,
      paymentUniqueCode: 400,
      payableAmountRpSnapshot: pkg.priceRp + 400,
      sessionCountSnapshot: pkg.sessionCount,
      durationDaysSnapshot: pkg.durationDays,
      status: 'APPROVED',
      timelineComplete: true,
      idempotencyKeyHash: 'seed-bsd-approved',
      submittedAt: ctx.at(-2),
      decidedAt: ctx.at(-2, 1),
      decidedById: financeId,
      decisionReasonCode: 'PAYMENT_VERIFIED',
    },
  });
  await seedPurchaseTimeline(ctx, approvedPurchaseId, [
    { key: 'created', type: 'ORDER_CREATED', occurredAt: ctx.at(-2) },
    { key: 'deadline', type: 'PAYMENT_DEADLINE_SET', occurredAt: ctx.at(-2, 0.1) },
    { key: 'proof', type: 'PROOF_SUBMITTED', occurredAt: ctx.at(-2, 0.5) },
    { key: 'scan', type: 'PROOF_SCAN_COMPLETED', occurredAt: ctx.at(-2, 0.75) },
    { key: 'approved', type: 'PAYMENT_APPROVED', occurredAt: ctx.at(-2, 1), reasonCode: 'PAYMENT_VERIFIED' },
  ]);
  const pendingProofId = ctx.id('payment-proof', 'bsd-pending');
  const bsdProof = await ensurePrivatePngFixture('seed/proofs/bsd-pending');
  await ctx.db.paymentProof.upsert({
    where: { id: pendingProofId },
    update: { checksum: bsdProof.checksum, mimeType: bsdProof.mimeType, sizeBytes: bsdProof.sizeBytes, uploadStatus: 'FINALIZED', scanStatus: 'CLEAN' },
    create: {
      id: pendingProofId,
      userId: customerId,
      branchId,
      packageId,
      objectKey: 'seed/proofs/bsd-pending',
      checksum: bsdProof.checksum,
      fileName: 'bsd-pending.png',
      mimeType: 'image/png',
      sizeBytes: bsdProof.sizeBytes,
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      finalizedAt: ctx.at(-1),
    },
  });
  await ctx.db.purchase.upsert({
    where: { id: ctx.id('purchase', 'bsd-pending') },
    update: { classTypeId, status: 'PENDING', paymentProofId: pendingProofId, paymentUniqueCode: 401, payableAmountRpSnapshot: pkg.priceRp + 401, paymentAccountId: paymentAccount.id, paymentExpiresAt: ctx.at(1), timelineComplete: true },
    create: {
      id: ctx.id('purchase', 'bsd-pending'),
      userId: customerId,
      branchId,
      packageId,
      classTypeId,
      paymentProofId: pendingProofId,
      paymentAccountId: paymentAccount.id,
      paymentBankNameSnapshot: paymentAccount.bankName,
      paymentAccountNumberSnapshotEncrypted: paymentAccount.accountNumberEncrypted,
      paymentAccountLast4Snapshot: paymentAccount.accountNumberLast4,
      paymentAccountHolderSnapshot: paymentAccount.accountHolderName,
      paymentExpiresAt: ctx.at(1),
      packageNameSnapshot: pkg.name,
      priceRpSnapshot: pkg.priceRp,
      paymentUniqueCode: 401,
      payableAmountRpSnapshot: pkg.priceRp + 401,
      sessionCountSnapshot: pkg.sessionCount,
      durationDaysSnapshot: pkg.durationDays,
      status: 'PENDING',
      timelineComplete: true,
      idempotencyKeyHash: 'seed-bsd-pending',
      submittedAt: ctx.at(-1),
    },
  });
  await seedPurchaseTimeline(ctx, ctx.id('purchase', 'bsd-pending'), [
    { key: 'created', type: 'ORDER_CREATED', occurredAt: ctx.at(-1) },
    { key: 'deadline', type: 'PAYMENT_DEADLINE_SET', occurredAt: ctx.at(-1) },
    { key: 'proof', type: 'PROOF_SUBMITTED', occurredAt: ctx.at(-1) },
    { key: 'scan', type: 'PROOF_SCAN_COMPLETED', occurredAt: ctx.at(-1) },
  ]);
  await ctx.db.paymentUniqueCodeReservation.upsert({
    where: { purchaseId: ctx.id('purchase', 'bsd-pending') },
    update: { paymentAccountId: paymentAccount.id, code: 401, expiresAt: ctx.at(1) },
    create: {
      id: ctx.id('payment-code-reservation', 'bsd-pending'),
      paymentAccountId: paymentAccount.id,
      purchaseId: ctx.id('purchase', 'bsd-pending'),
      code: 401,
      expiresAt: ctx.at(1),
    },
  });

  const customerPackageId = ctx.id('customer-package', 'bsd-approved');
  await ctx.db.customerPackage.upsert({
    where: { purchaseId: approvedPurchaseId },
    update: { status: 'ACTIVE' },
    create: {
      id: customerPackageId,
      purchaseId: approvedPurchaseId,
      customerUserId: customerId,
      branchId,
      packageId,
      classTypeId,
      activationDate: ctx.anchor,
      expiryAt: ctx.at(90),
      salePriceRp: pkg.priceRp,
      sessionCountSnapshot: pkg.sessionCount,
      durationDaysSnapshot: pkg.durationDays,
      projectionRateRp: 185_000,
    },
  });
  await seedPurchaseTimeline(ctx, approvedPurchaseId, [
    { key: 'activated', type: 'PACKAGE_ACTIVATED', occurredAt: ctx.anchor },
  ]);
  await ctx.db.ledgerEntry.upsert({
    where: {
      type_referenceType_referenceId: {
        type: 'PURCHASE',
        referenceType: 'PURCHASE',
        referenceId: approvedPurchaseId,
      },
    },
    update: { quantity: pkg.sessionCount },
    create: {
      id: ctx.id('ledger', 'bsd-purchase'),
      customerPackageId,
      type: 'PURCHASE',
      quantity: pkg.sessionCount,
      referenceType: 'PURCHASE',
      referenceId: approvedPurchaseId,
    },
  });
  const reservationId = ctx.id('reservation', 'bsd-active');
  await ctx.db.sessionReservation.upsert({
    where: {
      customerPackageId_referenceHash: {
        customerPackageId,
        referenceHash: 'seed-bsd-active',
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      id: reservationId,
      customerPackageId,
      classSlotId: slotIds.confirmed!,
      referenceHash: 'seed-bsd-active',
      quantity: 1,
      status: 'ACTIVE',
    },
  });
  await ctx.db.booking.upsert({
    where: { id: ctx.id('booking', 'bsd-active') },
    update: { status: 'BOOKED' },
    create: {
      id: ctx.id('booking', 'bsd-active'),
      branchId,
      classSlotId: slotIds.confirmed!,
      customerUserId: customerId,
      customerPackageId,
      reservationId,
      createdById: managerId,
      source: 'ADMIN_ASSISTED',
      status: 'BOOKED',
    },
  });
  for (const [key, status] of [
    ['risk', 'FAILED'],
    ['completed', 'SUCCEEDED'],
  ] as const) {
    const fixture = bsdQuotaJobFixture(ctx, key, status);
    await ctx.db.quotaEvaluationJob.upsert({
      where: { classSlotId: slotIds[key]! },
      update: {
        status,
        ...fixture,
      },
      create: {
        id: ctx.id('quota-job', `bsd-${status.toLowerCase()}`),
        classSlotId: slotIds[key]!,
        evaluationKey: `seed-bsd-${status.toLowerCase()}`,
        status,
        maxAttempts: 5,
        ...fixture,
      },
    });
  }
  for (let index = 0; index < 4; index++) {
    await ctx.db.auditLog.upsert({
      where: { id: ctx.id('audit', `bsd-${index}`) },
      update: {},
      create: {
        id: ctx.id('audit', `bsd-${index}`),
        occurredAt: ctx.at(-index),
        actorType: 'USER',
        actorId: managerId,
        branchId,
        targetUserId: customerId,
        action: `SEED_BSD_ACTIVITY_${index + 1}`,
        objectType: index % 2 ? 'Purchase' : 'ClassSlot',
        objectId: index % 2 ? approvedPurchaseId : slotIds.published!,
        correlationId: `seed-bsd-correlation-${index}`,
      },
    });
  }
}

export async function seedVolume(ctx: SeedContext, master: SeedMasterResult, users: Record<string, string>, count = 500) {
  const branchId = master.branches['DD-JKT']!; const studioId = master.studios['DD-JKT']!; const classTypeId = master.classTypes['DD-JKT:MAT']!; const packageId = master.packages['DD-JKT:MAT:8']!;
  const pkg = await ctx.db.package.findUniqueOrThrow({ where: { id: packageId } });
  for (let index = 0; index < count; index++) {
    const customerId = ctx.id('volume-user', index); const purchaseId = ctx.id('volume-purchase', index); const customerPackageId = ctx.id('volume-customer-package', index);
    const slotId = ctx.id('volume-slot', index); const reservationId = ctx.id('volume-reservation', index); const bookingId = ctx.id('volume-booking', index);
    await ctx.db.user.upsert({ where: { id: customerId }, update: { displayName: `Volume Customer ${String(index + 1).padStart(3, '0')}` }, create: { id: customerId, displayName: `Volume Customer ${String(index + 1).padStart(3, '0')}`, status: 'ACTIVE' } });
    await ctx.db.userRole.upsert({ where: { id: ctx.id('volume-role', index) }, update: { userId: customerId, role: 'CUSTOMER' }, create: { id: ctx.id('volume-role', index), userId: customerId, role: 'CUSTOMER', activeFrom: new Date('2026-01-01') } });
    await ctx.db.classSlot.upsert({ where: { id: slotId }, update: { bookedCount: 1 }, create: { id: slotId, branchId, studioId, classTypeId, instructorUserId: users.instructor!, startAt: ctx.at((index % 60) + 1, 6 + (index % 10)), endAt: ctx.at((index % 60) + 1, 7 + (index % 10)), timezone: 'Asia/Jakarta', minimumQuota: 3, capacity: 14, bookedCount: 1, status: 'PUBLISHED' } });
    await ctx.db.purchase.upsert({ where: { id: purchaseId }, update: { classTypeId, timelineComplete: true }, create: { id: purchaseId, userId: customerId, branchId, packageId, classTypeId, packageNameSnapshot: pkg.name, priceRpSnapshot: pkg.priceRp, sessionCountSnapshot: pkg.sessionCount, durationDaysSnapshot: pkg.durationDays, status: 'APPROVED', timelineComplete: true, idempotencyKeyHash: `volume-${index}`, submittedAt: ctx.at(-(index % 90), index % 12), decidedAt: ctx.at(-(index % 90), (index % 12) + 1), decidedById: users.finance!, decisionReasonCode: 'PAYMENT_VERIFIED' } });
    await seedPurchaseTimeline(ctx, purchaseId, [
      { key: 'created', type: 'ORDER_CREATED', occurredAt: ctx.at(-(index % 90), index % 12) },
      { key: 'approved', type: 'PAYMENT_APPROVED', occurredAt: ctx.at(-(index % 90), (index % 12) + 1), reasonCode: 'PAYMENT_VERIFIED' },
      { key: 'activated', type: 'PACKAGE_ACTIVATED', occurredAt: ctx.at(-(index % 90), (index % 12) + 1) },
    ]);
    await ctx.db.customerPackage.upsert({ where: { purchaseId }, update: {}, create: { id: customerPackageId, purchaseId, customerUserId: customerId, branchId, packageId, classTypeId, activationDate: ctx.anchor, expiryAt: ctx.at(90), salePriceRp: pkg.priceRp, sessionCountSnapshot: pkg.sessionCount, durationDaysSnapshot: pkg.durationDays, projectionRateRp: 125_000 } });
    await ctx.db.ledgerEntry.upsert({ where: { type_referenceType_referenceId: { type: 'PURCHASE', referenceType: 'PURCHASE', referenceId: purchaseId } }, update: {}, create: { id: ctx.id('volume-ledger', index), customerPackageId, type: 'PURCHASE', quantity: pkg.sessionCount, referenceType: 'PURCHASE', referenceId: purchaseId } });
    await ctx.db.sessionReservation.upsert({ where: { customerPackageId_referenceHash: { customerPackageId, referenceHash: `volume-${index}` } }, update: {}, create: { id: reservationId, customerPackageId, classSlotId: slotId, referenceHash: `volume-${index}`, quantity: 1, status: 'ACTIVE' } });
    await ctx.db.booking.upsert({ where: { id: bookingId }, update: {}, create: { id: bookingId, branchId, classSlotId: slotId, customerUserId: customerId, customerPackageId, reservationId, createdById: users.manager!, source: 'ADMIN_ASSISTED', status: 'BOOKED' } });
    await ctx.db.quotaEvaluationJob.upsert({ where: { classSlotId: slotId }, update: {}, create: { id: ctx.id('volume-job', index), classSlotId: slotId, evaluationKey: `volume-${index}`, dueAt: ctx.at(index % 60), status: index % 20 === 0 ? 'FAILED' : 'QUEUED', attempts: index % 20 === 0 ? 3 : 0, maxAttempts: 5, nextAttemptAt: ctx.at(index % 60, 1), lastErrorCode: index % 20 === 0 ? 'VOLUME_TIMEOUT' : null } });
    await ctx.db.auditLog.upsert({ where: { id: ctx.id('volume-audit', index) }, update: {}, create: { id: ctx.id('volume-audit', index), occurredAt: ctx.at(-(index % 90)), actorType: 'SYSTEM', branchId, targetUserId: customerId, action: 'VOLUME_FIXTURE_CREATED', objectType: 'Purchase', objectId: purchaseId, correlationId: `volume-${index}` } });
  }
}
