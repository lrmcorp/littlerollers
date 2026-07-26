import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { ClassSlotService } from './class-slot.service';
import { evaluateQuota } from '@dailydose/quota-evaluator';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('synthetic class-slot MySQL integration', () => {
  const db = new PrismaClient();
  const service = new ClassSlotService(
    db as never,
    new PolicyService(),
    new IdempotencyService(db as never),
    { value: { quotaEvaluation: { maxAttempts: 5 } } } as never,
  );
  const namespace = `class-slot-${Date.now()}`;
  const actorId = randomUUID(),
    instructorId = randomUUID(),
    customerId = randomUUID(),
    branchId = randomUUID(),
    classTypeId = randomUUID(),
    assignmentId = randomUUID(),
    availabilityId = randomUUID(),
    configId = randomUUID();
  const packageId = randomUUID(),
    proofId = randomUUID(),
    purchaseId = randomUUID(),
    customerPackageId = randomUUID(),
    reservationId = randomUUID();
  const principal = {
    sessionId: namespace,
    userId: actorId,
    roles: [{ role: 'ADMIN' as const, branchId }],
    capabilities: ['class-slot:read', 'class-slot:manage'],
    branchIds: [branchId],
  };

  beforeAll(async () => {
    await db.$connect();
    await db.user.createMany({
      data: [
        { id: actorId, displayName: 'Synthetic admin' },
        { id: instructorId, displayName: 'Synthetic instructor' },
        { id: customerId, displayName: 'Synthetic customer' },
      ],
    });
    await db.branch.create({
      data: { id: branchId, code: namespace, name: 'Synthetic branch', timezone: 'Asia/Jakarta' },
    });
    await db.classType.create({
      data: { id: classTypeId, branchId, code: 'REFORMER', name: 'Reformer' },
    });
    await db.assignment.create({
      data: {
        id: assignmentId,
        userId: instructorId,
        branchId,
        type: 'INSTRUCTOR',
        activeFrom: new Date('2026-01-01'),
      },
    });
    await db.instructorAvailability.create({
      data: {
        id: availabilityId,
        instructorUserId: instructorId,
        branchId,
        sourceAssignmentId: assignmentId,
        startAt: new Date('2026-08-01T00:00:00Z'),
        endAt: new Date('2026-08-02T00:00:00Z'),
        timezone: 'Asia/Jakarta',
      },
    });
    await db.effectiveConfiguration.create({
      data: {
        id: configId,
        kind: 'QUOTA_CAPACITY',
        businessKey: `${branchId}:${classTypeId}`,
        branchId,
        classTypeId,
        value: { minimumQuota: 2, defaultCapacity: 8 },
        effectiveFrom: new Date('2026-01-01'),
        approvedEvidence: 'SYNTHETIC_NON_PRODUCTION',
      },
    });
  });
  afterAll(async () => {
    const slots = await db.classSlot.findMany({ where: { branchId }, select: { id: true } });
    const slotIds = slots.map(({ id }) => id);
    await db.outboxEvent.deleteMany({
      where: { aggregateType: 'ClassSlot', aggregateId: { in: slotIds } },
    });
    await db.auditLog.deleteMany({ where: { objectType: 'ClassSlot', objectId: { in: slotIds } } });
    await db.quotaEvaluationJob.deleteMany({ where: { classSlotId: { in: slotIds } } });
    await db.idempotencyRecord.deleteMany({ where: { scope: { contains: actorId } } });
    await db.idempotencyRecord.deleteMany({
      where: {
        OR: [
          { scope: { startsWith: 'class-slot:assign:' } },
          { scope: { startsWith: 'class-slot:publish:' } },
          { scope: { startsWith: 'class-slot:cancel:' } },
        ],
      },
    });
    await db.sessionReservation.deleteMany({ where: { customerPackageId } });
    await db.customerPackage.deleteMany({ where: { id: customerPackageId } });
    await db.purchase.deleteMany({ where: { id: purchaseId } });
    await db.paymentProof.deleteMany({ where: { id: proofId } });
    await db.package.deleteMany({ where: { id: packageId } });
    await db.classSlot.deleteMany({ where: { branchId } });
    await db.effectiveConfiguration.delete({ where: { id: configId } });
    await db.instructorAvailability.delete({ where: { id: availabilityId } });
    await db.assignment.delete({ where: { id: assignmentId } });
    await db.classType.delete({ where: { id: classTypeId } });
    await db.branch.delete({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [actorId, instructorId, customerId] } } });
    await db.$disconnect();
  });

  it('creates, assigns, publishes and cancels exactly once with snapshots and events', async () => {
    const created = await service.create(
      principal,
      {
        branchId,
        classTypeId,
        startAt: '2026-08-01T09:00:00+07:00',
        endAt: '2026-08-01T10:00:00+07:00',
      },
      `${namespace}-create`,
      namespace,
    );
    expect(created.body).toMatchObject({ status: 'DRAFT', minimumQuota: 2, capacity: 8 });
    const id = (created.body as { id: string }).id;
    const assigned = await service.assign(
      principal,
      id,
      { instructorUserId: instructorId, expectedVersion: 0 },
      `${namespace}-assign`,
      namespace,
    );
    const published = await service.publish(
      principal,
      id,
      { expectedVersion: 1 },
      `${namespace}-publish`,
      namespace,
    );
    expect(published.body).toMatchObject({ status: 'PUBLISHED', version: 2 });
    const replay = await service.publish(
      principal,
      id,
      { expectedVersion: 1 },
      `${namespace}-publish`,
      namespace,
    );
    expect(replay.replay).toBe(true);
    await db.package.create({
      data: {
        id: packageId,
        branchId,
        classTypeId,
        businessKey: 'class-slot-reservation-fixture',
        name: 'Synthetic',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 100000,
        effectiveFrom: new Date('2026-01-01'),
      },
    });
    await db.paymentProof.create({
      data: {
        id: proofId,
        userId: customerId,
        branchId,
        packageId,
        objectKey: `synthetic/${proofId}`,
        checksum: 'masked',
        fileName: 'proof.png',
        mimeType: 'image/png',
        sizeBytes: 100,
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
      },
    });
    await db.purchase.create({
      data: {
        id: purchaseId,
        userId: customerId,
        branchId,
        packageId,
        paymentProofId: proofId,
        packageNameSnapshot: 'Synthetic',
        priceRpSnapshot: 100000,
        sessionCountSnapshot: 10,
        durationDaysSnapshot: 30,
        status: 'APPROVED',
        decidedAt: new Date('2026-08-01T00:00:00Z'),
        decidedById: actorId,
        decisionReasonCode: 'PAYMENT_VERIFIED',
        idempotencyKeyHash: randomUUID(),
      },
    });
    await db.customerPackage.create({
      data: {
        id: customerPackageId,
        purchaseId,
        customerUserId: customerId,
        branchId,
        packageId,
        classTypeId,
        activationDate: new Date('2026-08-01'),
        expiryAt: new Date('2026-09-01'),
        salePriceRp: 100000,
        sessionCountSnapshot: 10,
        durationDaysSnapshot: 30,
        projectionRateRp: 10000,
      },
    });
    await db.sessionReservation.create({
      data: {
        id: reservationId,
        customerPackageId,
        classSlotId: id,
        referenceHash: randomUUID(),
        quantity: 1,
      },
    });
    const cancelled = await service.cancel(
      principal,
      id,
      { reasonCode: 'STUDIO_UNAVAILABLE', expectedVersion: 2 },
      `${namespace}-cancel`,
      namespace,
    );
    expect(cancelled.body).toMatchObject({ status: 'CANCELLED', version: 3 });
    expect(await db.sessionReservation.findUnique({ where: { id: reservationId } })).toMatchObject({
      status: 'RELEASED',
    });
    expect(await db.outboxEvent.count({ where: { aggregateId: id } })).toBe(2);
    expect(await db.auditLog.count({ where: { objectId: id } })).toBe(4);
    expect(assigned.replay).toBe(false);
  });

  it('confirms or auto-cancels exactly once from authoritative active reservations', async () => {
    const createAndPublish = async (hour: number, suffix: string) => {
      const created = await service.create(
        principal,
        {
          branchId,
          classTypeId,
          instructorUserId: instructorId,
          startAt: `2026-08-01T${hour}:00:00+07:00`,
          endAt: `2026-08-01T${hour + 1}:00:00+07:00`,
        },
        `${namespace}-${suffix}-create`,
        namespace,
      );
      const id = (created.body as { id: string }).id;
      await service.publish(
        principal,
        id,
        { expectedVersion: 0 },
        `${namespace}-${suffix}-publish`,
        namespace,
      );
      const job = await db.quotaEvaluationJob.findUniqueOrThrow({ where: { classSlotId: id } });
      return { id, job };
    };
    const confirmed = await createAndPublish(14, 'confirmed');
    const confirmedReservation = randomUUID();
    await db.sessionReservation.create({
      data: {
        id: confirmedReservation,
        customerPackageId,
        classSlotId: confirmed.id,
        referenceHash: randomUUID(),
        quantity: 2,
      },
    });
    await expect(
      evaluateQuota(db, {
        jobId: confirmed.job.id,
        now: new Date('2026-07-31T06:59:59.999Z'),
        actor: { type: 'SYSTEM' },
        correlationId: namespace,
        syntheticEnabled: true,
      }),
    ).rejects.toMatchObject({ code: 'QUOTA_EVALUATION_NOT_DUE' });
    await expect(
      evaluateQuota(db, {
        jobId: confirmed.job.id,
        now: new Date('2026-07-31T07:00:00Z'),
        expectedDueAt: new Date('2026-07-31T07:00:01Z'),
        actor: { type: 'SYSTEM' },
        correlationId: namespace,
        syntheticEnabled: true,
      }),
    ).rejects.toMatchObject({ code: 'STALE_VERSION' });
    const confirmedResult = await evaluateQuota(db, {
      jobId: confirmed.job.id,
      now: new Date('2026-07-31T07:00:00Z'),
      actor: { type: 'SYSTEM' },
      correlationId: namespace,
      syntheticEnabled: true,
    });
    expect(confirmedResult).toMatchObject({ status: 'CONFIRMED', bookingCount: 2 });
    expect(
      await evaluateQuota(db, {
        jobId: confirmed.job.id,
        now: new Date('2026-07-31T08:01:00Z'),
        actor: { type: 'SYSTEM' },
        correlationId: namespace,
        syntheticEnabled: true,
      }),
    ).toMatchObject({ status: 'CONFIRMED', idempotentReplay: true });

    const cancelled = await createAndPublish(16, 'auto-cancelled');
    const releasedReservation = randomUUID();
    await db.sessionReservation.create({
      data: {
        id: releasedReservation,
        customerPackageId,
        classSlotId: cancelled.id,
        referenceHash: randomUUID(),
        quantity: 1,
      },
    });
    const cancelledResult = await evaluateQuota(db, {
      jobId: cancelled.job.id,
      now: new Date('2026-07-31T10:00:00Z'),
      actor: { type: 'SYSTEM' },
      correlationId: namespace,
      syntheticEnabled: true,
    });
    expect(cancelledResult).toMatchObject({ status: 'AUTO_CANCELLED', bookingCount: 1 });
    expect(cancelledResult.releasedReservationIds).toEqual([releasedReservation]);
    expect(
      await db.sessionReservation.findUniqueOrThrow({ where: { id: releasedReservation } }),
    ).toMatchObject({ status: 'RELEASED' });
    const started = await createAndPublish(18, 'already-started');
    await expect(
      evaluateQuota(db, {
        jobId: started.job.id,
        now: new Date('2026-08-01T11:00:00Z'),
        actor: { type: 'SYSTEM' },
        correlationId: namespace,
        syntheticEnabled: true,
      }),
    ).rejects.toMatchObject({ code: 'CLASS_ALREADY_STARTED' });
  });

  it('rejects missing availability, stale version, and overlap', async () => {
    const first = await service.create(
      principal,
      {
        branchId,
        classTypeId,
        instructorUserId: instructorId,
        startAt: '2026-08-01T11:00:00+07:00',
        endAt: '2026-08-01T12:00:00+07:00',
      },
      `${namespace}-first`,
      namespace,
    );
    await expect(
      service.create(
        principal,
        {
          branchId,
          classTypeId,
          instructorUserId: instructorId,
          startAt: '2026-08-01T11:30:00+07:00',
          endAt: '2026-08-01T12:30:00+07:00',
        },
        `${namespace}-overlap`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'SCHEDULE_CONFLICT' });
    const id = (first.body as { id: string }).id;
    await expect(
      service.publish(principal, id, { expectedVersion: 9 }, `${namespace}-stale`, namespace),
    ).rejects.toMatchObject({ code: 'STALE_VERSION' });
    await expect(
      service.create(
        principal,
        {
          branchId,
          classTypeId,
          instructorUserId: instructorId,
          startAt: '2026-08-03T09:00:00+07:00',
          endAt: '2026-08-03T10:00:00+07:00',
        },
        `${namespace}-missing`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'AVAILABILITY_REQUIRED' });
    await db.effectiveConfiguration.update({
      where: { id: configId },
      data: { effectiveUntil: new Date('2026-07-01') },
    });
    await expect(
      service.publish(
        principal,
        id,
        { expectedVersion: 0 },
        `${namespace}-configuration-removed`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'CONFIGURATION_REQUIRED' });
  });
});
