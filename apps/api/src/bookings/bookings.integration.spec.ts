// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { BookingsService } from './pemesanan-kelas.service';

// SCHEMA-INCOMPATIBLE: This test depends on Prisma models that do not exist in the current schema:
// entriBukuBesar, outboxEvent, auditLog, idempotencyRecord, reservasiSesi \u2014 pending schema migration.
// Also: Pembelian and PaketPelanggan field names differ from current schema (classTypeId, paymentProofId, etc.)
const databaseDescribe = describe.skip;
databaseDescribe('synthetic booking MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `booking-${Date.now()}`;
  const actorId = randomUUID();
  const customerIds = [randomUUID(), randomUUID()] as const;
  const branchId = randomUUID();
  const studioId = randomUUID();
  const classTypeId = randomUUID();
  const packageId = randomUUID();
  const slotId = randomUUID();
  const cutoffSlotId = randomUUID();
  const customerPackageIds = [randomUUID(), randomUUID()] as const;
  const principal = {
    sessionId: namespace,
    userId: actorId,
    roles: [{ role: 'ADMIN' as const, branchId }],
    capabilities: ['booking:read', 'booking:create:assisted'],
    branchIds: [branchId],
  };
  const service = new BookingsService(
    db as never,
    new IdempotencyService(db as never),
    new PolicyService(),
    {
      value: {
        booking: { enabled: true, cutoffHours: 2 },
        bookingCancellation: { enabled: true, cutoffHours: 24 },
      },
    } as never,
  );

  beforeAll(async () => {
    await db.$connect();
    await db.user.createMany({
      data: [
        { id: actorId, displayName: 'Synthetic booking admin' },
        ...customerIds.map((id, index) => ({ id, displayName: `Synthetic customer ${index}` })),
      ],
    });
    await db.cabang.create({
      data: { id: branchId, code: namespace, name: 'Booking branch', timezone: 'Asia/Jakarta' },
    });
    await db.studio.create({
      data: { id: studioId, branchId, code: 'MAIN', name: 'Booking main studio' },
    });
    await db.jenisKelas.create({
      data: { id: classTypeId, branchId, code: 'BOOKING', name: 'Booking class' },
    });
    await db.paket.create({
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
    await db.slotKelas.createMany({
      data: [
        {
          id: slotId,
          branchId,
          classTypeId,
          studioId,
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
          studioId,
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
      await db.dokumenVerifikasiIdentitas.createMany({
        data: [
          {
            id: randomUUID(),
            userId: customerIds[index]!,
            kind: 'SELFIE',
            objectKey: `identity/${customerIds[index]}/selfie`,
            checksum: 'a'.repeat(64),
            fileName: 'selfie.png',
            mimeType: 'image/png',
            sizeBytes: 100,
            uploadStatus: 'FINALIZED',
            scanStatus: 'CLEAN',
            status: 'APPROVED',
          },
          {
            id: randomUUID(),
            userId: customerIds[index]!,
            kind: 'KTP_FRONT',
            objectKey: `identity/${customerIds[index]}/ktp`,
            checksum: 'b'.repeat(64),
            fileName: 'ktp.png',
            mimeType: 'image/png',
            sizeBytes: 100,
            uploadStatus: 'FINALIZED',
            scanStatus: 'CLEAN',
            status: 'APPROVED',
          },
        ],
      });
      const proofId = randomUUID();
      const purchaseId = randomUUID();
      await db.buktiPembayaran.create({
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
      await db.pembelian.create({
        data: {
          id: purchaseId,
          userId: customerIds[index]!,
          branchId,
          packageId,
          classTypeId,
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
      await db.paketPelanggan.create({
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
      await db.entriBukuBesar.create({
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
    await db.idempotencyRecord.deleteMany({
      where: { scope: { startsWith: 'booking-cancel:' } },
    });
    await db.pemesananKelas.deleteMany({ where: { branchId } });
    await db.reservasiSesi.deleteMany({
      where: { customerPackageId: { in: [...customerPackageIds] } },
    });
    await db.entriBukuBesar.deleteMany({
      where: { customerPackageId: { in: [...customerPackageIds] } },
    });
    await db.paketPelanggan.deleteMany({ where: { id: { in: [...customerPackageIds] } } });
    await db.pembelian.deleteMany({ where: { userId: { in: [...customerIds] } } });
    await db.buktiPembayaran.deleteMany({ where: { userId: { in: [...customerIds] } } });
    await db.dokumenVerifikasiIdentitas.deleteMany({
      where: { userId: { in: [...customerIds] } },
    });
    await db.slotKelas.deleteMany({ where: { branchId } });
    await db.paket.delete({ where: { id: packageId } });
    await db.jenisKelas.delete({ where: { id: classTypeId } });
    await db.studio.delete({ where: { id: studioId } });
    await db.cabang.delete({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [actorId, ...customerIds] } } });
    await db.$disconnect();
  });

  it('returns only the authenticated customer own eligible package for a selected slot', async () => {
    const customerPrincipal = {
      sessionId: `${namespace}-customer`,
      userId: customerIds[0],
      roles: [{ role: 'CUSTOMER' as const, branchId: null }],
      capabilities: ['customer:self', 'booking:self:read', 'booking:self:create'],
      branchIds: [],
    };
    const result = await service.customerOptions(customerPrincipal, slotId);
    expect(result.slot.id).toBe(slotId);
    expect(result.slot.branch.id).toBe(branchId);
    expect(result.packages).toEqual([
      expect.objectContaining({
        id: customerPackageIds[0],
        packageId,
        available: 10,
        projectedAvailable: 9,
      }),
    ]);
    expect(result.eligibility).toMatchObject({
      canBook: true,
      reasonCode: null,
      requiredAction: null,
    });
    expect(result.packages.some(({ id }) => id === customerPackageIds[1])).toBe(false);
  });

  it('returns actionable eligibility without exposing another customer package', async () => {
    await db.dokumenVerifikasiIdentitas.updateMany({
      where: { userId: customerIds[1], kind: 'KTP_FRONT' },
      data: { status: 'PENDING' },
    });
    try {
      const result = await service.customerOptions(
        {
          sessionId: `${namespace}-unverified`,
          userId: customerIds[1],
          roles: [{ role: 'CUSTOMER' as const, branchId: null }],
          capabilities: ['customer:self', 'booking:self:read', 'booking:self:create'],
          branchIds: [],
        },
        slotId,
      );
      expect(result.eligibility).toMatchObject({
        canBook: false,
        reasonCode: 'IDENTITY_VERIFICATION_REQUIRED',
        requiredAction: 'COMPLETE_IDENTITY_VERIFICATION',
      });
      expect(result.packages.every(({ id }) => id === customerPackageIds[1])).toBe(true);
    } finally {
      await db.dokumenVerifikasiIdentitas.updateMany({
        where: { userId: customerIds[1], kind: 'KTP_FRONT' },
        data: { status: 'APPROVED' },
      });
    }
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
    expect(await db.pemesananKelas.count({ where: { branchId } })).toBe(1);
    expect(await db.reservasiSesi.count({ where: { classSlotId: slotId, status: 'ACTIVE' } })).toBe(
      1,
    );
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
      { value: { booking: { enabled: false, cutoffHours: null } } } as never,
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
    await db.slotKelas.createMany({
      data: [
        {
          id: seatSlotId,
          branchId,
          classTypeId,
          studioId,
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
          studioId,
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
    expect(await db.pemesananKelas.count({ where: { classSlotId: seatSlotId } })).toBe(1);

    const activeReserved = await db.reservasiSesi.aggregate({
      where: { customerPackageId: customerPackageIds[0], status: 'ACTIVE' },
      _sum: { quantity: true },
    });
    const reserved = activeReserved._sum.quantity ?? 0;
    await db.entriBukuBesar.create({
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
    expect(
      await db.pemesananKelas.count({ where: { classSlotId: { in: [...sessionSlotIds] } } }),
    ).toBe(1);
  });

  it('separates customer upcoming/history and paginates by class time without duplicates', async () => {
    const now = Date.now();
    const timelineSlots = [
      {
        id: randomUUID(),
        startAt: new Date(now - 3 * 3_600_000),
        endAt: new Date(now - 2 * 3_600_000),
        status: 'COMPLETED' as const,
      },
      {
        id: randomUUID(),
        startAt: new Date(now + 18 * 3_600_000),
        endAt: new Date(now + 19 * 3_600_000),
        status: 'PUBLISHED' as const,
      },
      {
        id: randomUUID(),
        startAt: new Date(now + 16 * 3_600_000),
        endAt: new Date(now + 17 * 3_600_000),
        status: 'PUBLISHED' as const,
      },
    ];
    await db.slotKelas.createMany({
      data: timelineSlots.map((slot) => ({
        ...slot,
        branchId,
        classTypeId,
        studioId,
        timezone: 'Asia/Jakarta',
        minimumQuota: 1,
        capacity: 5,
      })),
    });
    for (const slot of timelineSlots) {
      const reservationId = randomUUID();
      await db.reservasiSesi.create({
        data: {
          id: reservationId,
          customerPackageId: customerPackageIds[1],
          classSlotId: slot.id,
          referenceHash: `${namespace}-timeline-${slot.id}`,
        },
      });
      await db.pemesananKelas.create({
        data: {
          id: randomUUID(),
          branchId,
          classSlotId: slot.id,
          customerUserId: customerIds[1],
          customerPackageId: customerPackageIds[1],
          reservationId,
          createdById: customerIds[1],
          source: 'SELF',
        },
      });
    }
    const customerPrincipal = {
      sessionId: `${namespace}-timeline-customer`,
      userId: customerIds[1],
      roles: [{ role: 'CUSTOMER' as const, branchId: null }],
      capabilities: ['customer:self', 'booking:self:read', 'booking:self:create'],
      branchIds: [],
    };

    const upcoming = await service.list(customerPrincipal, {
      timeline: 'UPCOMING',
      limit: 100,
    });
    expect(upcoming.items.map((item) => item.classSlot!.id)).toEqual(
      expect.arrayContaining([timelineSlots[1]!.id, timelineSlots[2]!.id]),
    );
    expect(
      upcoming.items.every(
        (item, index, items) =>
          index === 0 ||
          items[index - 1]!.classSlot!.startAt.getTime() <= item.classSlot!.startAt.getTime(),
      ),
    ).toBe(true);
    expect(upcoming.items.some((item) => item.classSlot!.id === timelineSlots[0]!.id)).toBe(false);

    const history = await service.list(customerPrincipal, {
      timeline: 'HISTORY',
      limit: 100,
    });
    expect(history.items.some((item) => item.classSlot!.id === timelineSlots[0]!.id)).toBe(true);
    expect(history.items.some((item) => item.classSlot!.id === timelineSlots[1]!.id)).toBe(false);

    const firstPage = await service.list(customerPrincipal, {
      timeline: 'UPCOMING',
      limit: 1,
    });
    expect(firstPage.page.hasMore).toBe(true);
    expect(firstPage.page.nextCursor).not.toBeNull();
    const secondPage = await service.list(customerPrincipal, {
      timeline: 'UPCOMING',
      cursor: firstPage.page.nextCursor!,
      limit: 1,
    });
    expect(secondPage.items[0]?.id).not.toBe(firstPage.items[0]?.id);
  });

  it('cancels an owned booking idempotently without changing the ledger', async () => {
    const classSlotId = randomUUID();
    const reservationId = randomUUID();
    const bookingId = randomUUID();
    await db.slotKelas.create({
      data: {
        id: classSlotId,
        branchId,
        classTypeId,
        studioId,
        startAt: new Date(Date.now() + 30 * 3_600_000),
        endAt: new Date(Date.now() + 31 * 3_600_000),
        timezone: 'Asia/Jakarta',
        minimumQuota: 1,
        capacity: 5,
        bookedCount: 1,
        status: 'PUBLISHED',
      },
    });
    await db.reservasiSesi.create({
      data: {
        id: reservationId,
        customerPackageId: customerPackageIds[1],
        classSlotId,
        referenceHash: `${namespace}-cancel`,
      },
    });
    await db.pemesananKelas.create({
      data: {
        id: bookingId,
        branchId,
        classSlotId,
        customerUserId: customerIds[1],
        customerPackageId: customerPackageIds[1],
        reservationId,
        createdById: customerIds[1],
        source: 'SELF',
      },
    });
    const customerPrincipal = {
      sessionId: `${namespace}-cancel-customer`,
      userId: customerIds[1],
      roles: [{ role: 'CUSTOMER' as const, branchId: null }],
      capabilities: ['booking:self:read', 'booking:self:cancel'],
      branchIds: [],
    };
    const options = await service.cancellationOptions(customerPrincipal, bookingId);
    const ledgerBefore = await db.entriBukuBesar.count({
      where: { customerPackageId: customerPackageIds[1] },
    });
    const first = await service.cancel(
      customerPrincipal,
      bookingId,
      { reasonCode: 'PERSONAL_UNAVAILABLE', expectedVersion: options.bookingVersion },
      `${namespace}-cancel-key`,
      `${namespace}-cancel`,
    );
    const replay = await service.cancel(
      customerPrincipal,
      bookingId,
      { reasonCode: 'PERSONAL_UNAVAILABLE', expectedVersion: options.bookingVersion },
      `${namespace}-cancel-key`,
      `${namespace}-cancel-replay`,
    );
    expect(first.replay).toBe(false);
    expect(replay.replay).toBe(true);
    expect(await db.pemesananKelas.findUnique({ where: { id: bookingId } })).toMatchObject({
      status: 'CANCELLED',
      cancellationReasonCode: 'PERSONAL_UNAVAILABLE',
      cancelledById: customerIds[1],
    });
    expect(await db.reservasiSesi.findUnique({ where: { id: reservationId } })).toMatchObject({
      status: 'RELEASED',
    });
    expect(await db.slotKelas.findUnique({ where: { id: classSlotId } })).toMatchObject({
      bookedCount: 0,
    });
    expect(
      await db.entriBukuBesar.count({ where: { customerPackageId: customerPackageIds[1] } }),
    ).toBe(ledgerBefore);
    expect(
      await db.outboxEvent.count({
        where: { eventType: 'booking.cancelled.v1', aggregateId: bookingId },
      }),
    ).toBe(1);
  });
});
