import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { ReschedulesService } from './reschedules.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('synthetic reschedule PostgreSQL integration', () => {
  const db = new PrismaClient();
  const namespace = `reschedule-${Date.now()}`;
  const adminId = randomUUID();
  const customerIds = [randomUUID(), randomUUID()] as const;
  const branchId = randomUUID();
  const classTypeId = randomUUID();
  const packageId = randomUUID();
  const customerPackageIds = [randomUUID(), randomUUID()] as const;
  const sourceSlotIds = [randomUUID(), randomUUID()] as const;
  const targetSlotIds = [randomUUID(), randomUUID()] as const;
  const bookingIds = [randomUUID(), randomUUID()] as const;
  const reservationIds = [randomUUID(), randomUUID()] as const;
  const admin = {
    sessionId: namespace,
    userId: adminId,
    assurance: 'MFA' as const,
    roles: [{ role: 'ADMIN' as const, branchId }],
    capabilities: ['reschedule:read', 'reschedule:decide'],
    branchIds: [branchId],
  };
  const config = {
    value: {
      booking: { syntheticEnabled: true, cutoffHours: 2 },
      reschedule: { syntheticEnabled: true, cutoffHours: 24 },
    },
  } as never;
  const service = new ReschedulesService(
    db as never,
    new IdempotencyService(db as never),
    new PolicyService(),
    config,
  );
  const customerPrincipal = (index: number) => ({
    sessionId: `${namespace}-customer-${index}`,
    userId: customerIds[index]!,
    assurance: 'BASE' as const,
    roles: [{ role: 'CUSTOMER' as const, branchId: null }],
    capabilities: ['reschedule:self:read', 'reschedule:self:request'],
    branchIds: [] as string[],
  });

  beforeAll(async () => {
    await db.$connect();
    await db.user.createMany({
      data: [
        { id: adminId, displayName: 'Synthetic reschedule admin' },
        ...customerIds.map((id, index) => ({
          id,
          displayName: `Synthetic reschedule customer ${index}`,
        })),
      ],
    });
    await db.branch.create({
      data: { id: branchId, code: namespace, name: 'Reschedule branch', timezone: 'Asia/Jakarta' },
    });
    await db.classType.create({
      data: { id: classTypeId, branchId, code: 'RESCHEDULE', name: 'Reschedule class' },
    });
    await db.package.create({
      data: {
        id: packageId,
        branchId,
        classTypeId,
        businessKey: namespace,
        name: 'Synthetic reschedule package',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 100000,
        effectiveFrom: new Date('2026-01-01'),
      },
    });
    const now = Date.now();
    await db.classSlot.createMany({
      data: [
        ...sourceSlotIds.map((id, index) => ({
          id,
          branchId,
          classTypeId,
          startAt: new Date(now + (48 + index * 4) * 3_600_000),
          endAt: new Date(now + (49 + index * 4) * 3_600_000),
          timezone: 'Asia/Jakarta',
          minimumQuota: 1,
          capacity: 5,
          bookedCount: 1,
          status: 'CONFIRMED' as const,
        })),
        ...targetSlotIds.map((id, index) => ({
          id,
          branchId,
          classTypeId,
          startAt: new Date(now + (72 + index * 4) * 3_600_000),
          endAt: new Date(now + (73 + index * 4) * 3_600_000),
          timezone: 'Asia/Jakarta',
          minimumQuota: 1,
          capacity: 5,
          status: 'PUBLISHED' as const,
        })),
      ],
    });
    for (let index = 0; index < customerIds.length; index += 1) {
      const proofId = randomUUID();
      const purchaseId = randomUUID();
      await db.paymentProof.create({
        data: {
          id: proofId,
          userId: customerIds[index]!,
          branchId,
          packageId,
          objectKey: `${namespace}/${proofId}`,
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
          userId: customerIds[index]!,
          branchId,
          packageId,
          paymentProofId: proofId,
          packageNameSnapshot: 'Synthetic reschedule package',
          priceRpSnapshot: 100000,
          sessionCountSnapshot: 10,
          durationDaysSnapshot: 30,
          status: 'APPROVED',
          decidedAt: new Date(),
          decidedById: adminId,
          decisionReasonCode: 'PAYMENT_VERIFIED',
          idempotencyKeyHash: randomUUID(),
        },
      });
      await db.customerPackage.create({
        data: {
          id: customerPackageIds[index]!,
          purchaseId,
          customerUserId: customerIds[index]!,
          branchId,
          packageId,
          classTypeId,
          activationDate: new Date('2026-01-01'),
          expiryAt: new Date(Date.now() + 30 * 86_400_000),
          salePriceRp: 100000,
          sessionCountSnapshot: 10,
          durationDaysSnapshot: 30,
          projectionRateRp: 10000,
        },
      });
      await db.sessionReservation.create({
        data: {
          id: reservationIds[index]!,
          customerPackageId: customerPackageIds[index]!,
          classSlotId: sourceSlotIds[index]!,
          referenceHash: randomUUID(),
        },
      });
      await db.booking.create({
        data: {
          id: bookingIds[index]!,
          branchId,
          classSlotId: sourceSlotIds[index]!,
          customerUserId: customerIds[index]!,
          customerPackageId: customerPackageIds[index]!,
          reservationId: reservationIds[index]!,
          createdById: customerIds[index]!,
          source: 'SELF',
        },
      });
    }
  });

  afterAll(async () => {
    await db.outboxEvent.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.auditLog.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.idempotencyRecord.deleteMany({ where: { scope: { startsWith: 'reschedule-' } } });
    await db.reschedule.deleteMany({ where: { branchId } });
    await db.booking.deleteMany({ where: { branchId } });
    await db.sessionReservation.deleteMany({
      where: { customerPackageId: { in: [...customerPackageIds] } },
    });
    await db.customerPackage.deleteMany({ where: { id: { in: [...customerPackageIds] } } });
    await db.purchase.deleteMany({ where: { userId: { in: [...customerIds] } } });
    await db.paymentProof.deleteMany({ where: { userId: { in: [...customerIds] } } });
    await db.classSlot.deleteMany({ where: { branchId } });
    await db.package.delete({ where: { id: packageId } });
    await db.classType.delete({ where: { id: classTypeId } });
    await db.branch.delete({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [adminId, ...customerIds] } } });
    await db.$disconnect();
  });

  it('requests then atomically approves and authoritatively replays one move', async () => {
    const requested = await service.request(
      customerPrincipal(0),
      {
        bookingId: bookingIds[0],
        targetClassSlotId: targetSlotIds[0],
        reasonCode: 'PERSONAL_UNAVAILABLE',
        expectedBookingVersion: 0,
      },
      `${namespace}-request-0`,
      `${namespace}-request-0`,
    );
    const reschedule = requested.body as unknown as { id: string; version: number };
    expect((await db.booking.findUnique({ where: { id: bookingIds[0] } }))?.status).toBe(
      'RESCHEDULE_PENDING',
    );
    expect(
      (await db.sessionReservation.findUnique({ where: { id: reservationIds[0] } }))?.classSlotId,
    ).toBe(sourceSlotIds[0]);

    const command = {
      reasonCode: 'ELIGIBILITY_VERIFIED' as const,
      expectedVersion: reschedule.version,
    };
    const approved = await service.decide(
      admin,
      reschedule.id,
      'approve',
      command,
      `${namespace}-decision-0`,
      `${namespace}-decision-0`,
    );
    const replay = await service.decide(
      admin,
      reschedule.id,
      'approve',
      command,
      `${namespace}-decision-0`,
      `${namespace}-decision-0-replay`,
    );
    expect(approved.replay).toBe(false);
    expect(replay.replay).toBe(true);
    expect((await db.booking.findUnique({ where: { id: bookingIds[0] } }))?.classSlotId).toBe(
      targetSlotIds[0],
    );
    expect(
      (await db.sessionReservation.findUnique({ where: { id: reservationIds[0] } }))?.classSlotId,
    ).toBe(targetSlotIds[0]);
    expect(
      await db.outboxEvent.count({ where: { correlationId: `${namespace}-decision-0` } }),
    ).toBe(1);
    expect(await db.auditLog.count({ where: { correlationId: `${namespace}-decision-0` } })).toBe(
      1,
    );
  });

  it('rejects without moving the source reservation', async () => {
    const requested = await service.request(
      customerPrincipal(1),
      {
        bookingId: bookingIds[1],
        targetClassSlotId: targetSlotIds[1],
        reasonCode: 'WRONG_CLASS_SELECTED',
        expectedBookingVersion: 0,
      },
      `${namespace}-request-1`,
      `${namespace}-request-1`,
    );
    const reschedule = requested.body as unknown as { id: string; version: number };
    await service.decide(
      admin,
      reschedule.id,
      'reject',
      { reasonCode: 'OUTSIDE_POLICY', expectedVersion: reschedule.version },
      `${namespace}-decision-1`,
      `${namespace}-decision-1`,
    );
    expect((await db.booking.findUnique({ where: { id: bookingIds[1] } }))?.status).toBe('BOOKED');
    expect(
      (await db.sessionReservation.findUnique({ where: { id: reservationIds[1] } }))?.classSlotId,
    ).toBe(sourceSlotIds[1]);
  });

  it('fails closed without configuration and requires MFA for decision', async () => {
    const gated = new ReschedulesService(
      db as never,
      new IdempotencyService(db as never),
      new PolicyService(),
      {
        value: {
          booking: { syntheticEnabled: true, cutoffHours: 2 },
          reschedule: { syntheticEnabled: false, cutoffHours: null },
        },
      } as never,
    );
    await expect(
      gated.request(
        customerPrincipal(0),
        {
          bookingId: bookingIds[0],
          targetClassSlotId: targetSlotIds[1],
          reasonCode: 'PERSONAL_UNAVAILABLE',
          expectedBookingVersion: 2,
        },
        `${namespace}-gated`,
        `${namespace}-gated`,
      ),
    ).rejects.toThrow('CONFIGURATION_REQUIRED');
    await expect(
      service.decide(
        { ...admin, assurance: 'BASE' },
        randomUUID(),
        'approve',
        { reasonCode: 'ELIGIBILITY_VERIFIED', expectedVersion: 0 },
        `${namespace}-base`,
        `${namespace}-base`,
      ),
    ).rejects.toThrow('MFA_REQUIRED');
  });
});
