import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { BookingsService } from './bookings.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('synthetic booking PostgreSQL integration', () => {
  const db = new PrismaClient();
  const namespace = `booking-${Date.now()}`;
  const actorId = randomUUID();
  const customerIds = [randomUUID(), randomUUID()] as const;
  const branchId = randomUUID();
  const classTypeId = randomUUID();
  const packageId = randomUUID();
  const slotId = randomUUID();
  const cutoffSlotId = randomUUID();
  const customerPackageIds = [randomUUID(), randomUUID()] as const;
  const principal = {
    sessionId: namespace,
    userId: actorId,
    assurance: 'BASE' as const,
    roles: [{ role: 'ADMIN' as const, branchId }],
    capabilities: ['booking:read', 'booking:create:assisted'],
    branchIds: [branchId],
  };
  const service = new BookingsService(
    db as never,
    new IdempotencyService(db as never),
    new PolicyService(),
    { value: { booking: { syntheticEnabled: true, cutoffHours: 2 } } } as never,
  );

  beforeAll(async () => {
    await db.$connect();
    await db.user.createMany({
      data: [
        { id: actorId, displayName: 'Synthetic booking admin' },
        ...customerIds.map((id, index) => ({ id, displayName: `Synthetic customer ${index}` })),
      ],
    });
    await db.branch.create({
      data: { id: branchId, code: namespace, name: 'Booking branch', timezone: 'Asia/Jakarta' },
    });
    await db.classType.create({
      data: { id: classTypeId, branchId, code: 'BOOKING', name: 'Booking class' },
    });
    await db.package.create({
      data: {
        id: packageId,
        branchId,
        classTypeId,
        businessKey: namespace,
        name: 'Synthetic booking package',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 100000,
        effectiveFrom: new Date('2026-01-01'),
      },
    });
    const now = Date.now();
    await db.classSlot.createMany({
      data: [
        {
          id: slotId,
          branchId,
          classTypeId,
          startAt: new Date(now + 6 * 3_600_000),
          endAt: new Date(now + 7 * 3_600_000),
          timezone: 'Asia/Jakarta',
          minimumQuota: 1,
          capacity: 1,
          status: 'PUBLISHED',
        },
        {
          id: cutoffSlotId,
          branchId,
          classTypeId,
          startAt: new Date(now + 60 * 60_000),
          endAt: new Date(now + 2 * 60 * 60_000),
          timezone: 'Asia/Jakarta',
          minimumQuota: 1,
          capacity: 5,
          status: 'CONFIRMED',
        },
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
          userId: customerIds[index]!,
          branchId,
          packageId,
          paymentProofId: proofId,
          packageNameSnapshot: 'Synthetic booking package',
          priceRpSnapshot: 100000,
          sessionCountSnapshot: 10,
          durationDaysSnapshot: 30,
          status: 'APPROVED',
          decidedAt: new Date(),
          decidedById: actorId,
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
      await db.ledgerEntry.create({
        data: {
          id: randomUUID(),
          customerPackageId: customerPackageIds[index]!,
          type: 'PURCHASE',
          quantity: 10,
          referenceType: 'Purchase',
          referenceId: purchaseId,
        },
      });
    }
  });

  afterAll(async () => {
    await db.outboxEvent.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.auditLog.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.idempotencyRecord.deleteMany({ where: { scope: `booking-create:${actorId}` } });
    await db.booking.deleteMany({ where: { branchId } });
    await db.sessionReservation.deleteMany({
      where: { customerPackageId: { in: [...customerPackageIds] } },
    });
    await db.ledgerEntry.deleteMany({
      where: { customerPackageId: { in: [...customerPackageIds] } },
    });
    await db.customerPackage.deleteMany({ where: { id: { in: [...customerPackageIds] } } });
    await db.purchase.deleteMany({ where: { userId: { in: [...customerIds] } } });
    await db.paymentProof.deleteMany({ where: { userId: { in: [...customerIds] } } });
    await db.classSlot.deleteMany({ where: { branchId } });
    await db.package.delete({ where: { id: packageId } });
    await db.classType.delete({ where: { id: classTypeId } });
    await db.branch.delete({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [actorId, ...customerIds] } } });
    await db.$disconnect();
  });

  it('atomically creates one booking/reservation/audit/event and replays it', async () => {
    const command = {
      classSlotId: slotId,
      customerPackageId: customerPackageIds[0],
      customerUserId: customerIds[0],
      source: 'ADMIN_ASSISTED' as const,
    };
    const first = await service.create(
      principal,
      command,
      `${namespace}-key`,
      `${namespace}-create`,
    );
    const replay = await service.create(
      principal,
      command,
      `${namespace}-key`,
      `${namespace}-replay`,
    );
    expect(first.replay).toBe(false);
    expect(replay.replay).toBe(true);
    expect(await db.booking.count({ where: { branchId } })).toBe(1);
    expect(
      await db.sessionReservation.count({ where: { classSlotId: slotId, status: 'ACTIVE' } }),
    ).toBe(1);
    expect(await db.auditLog.count({ where: { correlationId: `${namespace}-create` } })).toBe(1);
    expect(await db.outboxEvent.count({ where: { correlationId: `${namespace}-create` } })).toBe(1);
  });

  it('rejects a changed replay, duplicate booking, full capacity, and H-2 cutoff', async () => {
    await expect(
      service.create(
        principal,
        {
          classSlotId: cutoffSlotId,
          customerPackageId: customerPackageIds[0],
          customerUserId: customerIds[0],
          source: 'ADMIN_ASSISTED',
        },
        `${namespace}-key`,
        `${namespace}-changed`,
      ),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUSED');
    await expect(
      service.create(
        principal,
        {
          classSlotId: slotId,
          customerPackageId: customerPackageIds[0],
          customerUserId: customerIds[0],
          source: 'ADMIN_ASSISTED',
        },
        `${namespace}-duplicate`,
        `${namespace}-duplicate`,
      ),
    ).rejects.toThrow('DUPLICATE_ACTIVE_BOOKING');
    await expect(
      service.create(
        principal,
        {
          classSlotId: slotId,
          customerPackageId: customerPackageIds[1],
          customerUserId: customerIds[1],
          source: 'ADMIN_ASSISTED',
        },
        `${namespace}-full`,
        `${namespace}-full`,
      ),
    ).rejects.toThrow('CLASS_CAPACITY_FULL');
    await expect(
      service.create(
        principal,
        {
          classSlotId: cutoffSlotId,
          customerPackageId: customerPackageIds[1],
          customerUserId: customerIds[1],
          source: 'ADMIN_ASSISTED',
        },
        `${namespace}-cutoff`,
        `${namespace}-cutoff`,
      ),
    ).rejects.toThrow('BOOKING_CUTOFF_PASSED');
  });

  it('fails closed when synthetic booking policy is unavailable', async () => {
    const gated = new BookingsService(
      db as never,
      new IdempotencyService(db as never),
      new PolicyService(),
      { value: { booking: { syntheticEnabled: false, cutoffHours: null } } } as never,
    );
    await expect(
      gated.create(
        principal,
        {
          classSlotId: cutoffSlotId,
          customerPackageId: customerPackageIds[1],
          customerUserId: customerIds[1],
          source: 'ADMIN_ASSISTED',
        },
        `${namespace}-gated`,
        `${namespace}-gated`,
      ),
    ).rejects.toThrow('CONFIGURATION_REQUIRED');
  });

  it('allows only one winner for the last seat and last available session', async () => {
    const now = Date.now();
    const seatSlotId = randomUUID();
    const sessionSlotIds = [randomUUID(), randomUUID()] as const;
    await db.classSlot.createMany({
      data: [
        {
          id: seatSlotId,
          branchId,
          classTypeId,
          startAt: new Date(now + 8 * 3_600_000),
          endAt: new Date(now + 9 * 3_600_000),
          timezone: 'Asia/Jakarta',
          minimumQuota: 1,
          capacity: 1,
          status: 'PUBLISHED',
        },
        ...sessionSlotIds.map((id, index) => ({
          id,
          branchId,
          classTypeId,
          startAt: new Date(now + (10 + index * 2) * 3_600_000),
          endAt: new Date(now + (11 + index * 2) * 3_600_000),
          timezone: 'Asia/Jakarta',
          minimumQuota: 1,
          capacity: 5,
          status: 'PUBLISHED' as const,
        })),
      ],
    });
    const seatResults = await Promise.allSettled(
      customerIds.map((customerUserId, index) =>
        service.create(
          principal,
          {
            classSlotId: seatSlotId,
            customerPackageId: customerPackageIds[index]!,
            customerUserId,
            source: 'ADMIN_ASSISTED',
          },
          `${namespace}-seat-${index}`,
          `${namespace}-seat-${index}`,
        ),
      ),
    );
    expect(seatResults.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(await db.booking.count({ where: { classSlotId: seatSlotId } })).toBe(1);

    const activeReserved = await db.sessionReservation.aggregate({
      where: { customerPackageId: customerPackageIds[0], status: 'ACTIVE' },
      _sum: { quantity: true },
    });
    const reserved = activeReserved._sum.quantity ?? 0;
    await db.ledgerEntry.create({
      data: {
        id: randomUUID(),
        customerPackageId: customerPackageIds[0],
        type: 'ADJUST_MANUAL',
        quantity: -(10 - reserved - 1),
        referenceType: 'SyntheticBookingConcurrency',
        referenceId: randomUUID(),
      },
    });
    const sessionResults = await Promise.allSettled(
      sessionSlotIds.map((classSlotId, index) =>
        service.create(
          principal,
          {
            classSlotId,
            customerPackageId: customerPackageIds[0],
            customerUserId: customerIds[0],
            source: 'ADMIN_ASSISTED',
          },
          `${namespace}-session-${index}`,
          `${namespace}-session-${index}`,
        ),
      ),
    );
    expect(sessionResults.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(await db.booking.count({ where: { classSlotId: { in: [...sessionSlotIds] } } })).toBe(1);
  });
});
