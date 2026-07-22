import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { ClassSlotService } from './class-slot.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('synthetic class-slot PostgreSQL integration', () => {
  const db = new PrismaClient();
  const service = new ClassSlotService(
    db as never,
    new PolicyService(),
    new IdempotencyService(db as never),
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
    assurance: 'MFA' as const,
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
    await db.sessionReservation.deleteMany({ where: { id: reservationId } });
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

  it('rejects missing availability, stale version, overlap, and base assurance', async () => {
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
      service.publish(
        { ...principal, assurance: 'BASE' },
        id,
        { expectedVersion: 0 },
        `${namespace}-base`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'MFA_REQUIRED' });
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
