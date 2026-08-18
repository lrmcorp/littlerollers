import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { ReschedulesService } from './reschedules.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('synthetic reschedule MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `reschedule-${Date.now()}`;
  const adminId = randomUUID();
  const customerIds = [randomUUID(), randomUUID()] as const;
  const branchId = randomUUID();
  const studioId = randomUUID();
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
    roles: [{ role: 'ADMIN' as const, branchId }],
    capabilities: ['reschedule:read', 'reschedule:decide'],
    branchIds: [branchId],
  };
  const config = {
    value: {
      booking: { enabled: true, cutoffHours: 2 },
      reschedule: { enabled: true, cutoffHours: 24 },
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
    await db.cabang.create({
      data: { id: branchId, code: namespace, name: 'Reschedule branch', timezone: 'Asia/Jakarta' },
    });
    await db.studio.create({
      data: { id: studioId, branchId, code: 'MAIN', name: 'Reschedule main studio' },
    });
    await db.jenisKelas.create({
      data: { id: classTypeId, branchId, code: 'RESCHEDULE', name: 'Reschedule class' },
    });
    await db.paket.create({
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
    await db.slotKelas.createMany({
      data: [
        ...sourceSlotIds.map((id, index) => ({
          id,
          branchId,
          classTypeId,
          studioId,
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
          studioId,
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
      await db.buktiPembayaran.create({
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
      await db.pembelian.create({
        data: {
          id: purchaseId,
          userId: customerIds[index]!,
          branchId,
          packageId,
          classTypeId,
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
      await db.reservasiSesi.create({
        data: {
          id: reservationIds[index]!,
          customerPackageId: customerPackageIds[index]!,
          classSlotId: sourceSlotIds[index]!,
          referenceHash: randomUUID(),
        },
      });
      await db.pemesananKelas.create({
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
    await db.ubahJadwal.deleteMany({ where: { branchId } });
    await db.pemesananKelas.deleteMany({ where: { branchId } });
    await db.reservasiSesi.deleteMany({
      where: { customerPackageId: { in: [...customerPackageIds] } },
    });
    await db.paketPelanggan.deleteMany({ where: { id: { in: [...customerPackageIds] } } });
    await db.pembelian.deleteMany({ where: { userId: { in: [...customerIds] } } });
    await db.buktiPembayaran.deleteMany({ where: { userId: { in: [...customerIds] } } });
    await db.slotKelas.deleteMany({ where: { branchId } });
    await db.paket.delete({ where: { id: packageId } });
    await db.jenisKelas.delete({ where: { id: classTypeId } });
    await db.studio.delete({ where: { id: studioId } });
    await db.cabang.delete({ where: { id: branchId } });
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
    expect((await db.pemesananKelas.findUnique({ where: { id: bookingIds[0] } }))?.status).toBe(
      'RESCHEDULE_PENDING',
    );
    expect(
      (await db.reservasiSesi.findUnique({ where: { id: reservationIds[0] } }))?.classSlotId,
    ).toBe(sourceSlotIds[0]);

    const command = {
      reasonCode: 'ELIGIBILITY_VERIFIED' as const,
      expectedVersion: reschedule.version,
    };
    await expect(
      service.decide(
        {
          ...customerPrincipal(0),
          capabilities: [...customerPrincipal(0).capabilities, 'reschedule:decide'],
          branchIds: [branchId],
        },
        reschedule.id,
        'approve',
        command,
        `${namespace}-self-decision-0`,
        `${namespace}-self-decision-0`,
      ),
    ).rejects.toThrow('SELF_APPROVAL_FORBIDDEN');
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
    expect((await db.pemesananKelas.findUnique({ where: { id: bookingIds[0] } }))?.classSlotId).toBe(
      targetSlotIds[0],
    );
    expect(
      (await db.reservasiSesi.findUnique({ where: { id: reservationIds[0] } }))?.classSlotId,
    ).toBe(targetSlotIds[0]);
    expect(
      await db.outboxEvent.count({ where: { correlationId: `${namespace}-decision-0` } }),
    ).toBe(1);
    expect(await db.auditLog.count({ where: { correlationId: `${namespace}-decision-0` } })).toBe(
      1,
    );
    expect(
      await db.outboxEvent.count({
        where: {
          correlationId: `${namespace}-request-0`,
          eventType: 'booking.reschedule_requested.v1',
        },
      }),
    ).toBe(1);
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
    const duplicateReservationId = randomUUID();
    const duplicateBookingId = randomUUID();
    await db.reservasiSesi.create({
      data: {
        id: duplicateReservationId,
        customerPackageId: customerPackageIds[1],
        classSlotId: targetSlotIds[1],
        quantity: 1,
        status: 'ACTIVE',
        referenceHash: `${namespace}-duplicate-target-reservation`,
      },
    });
    await db.pemesananKelas.create({
      data: {
        id: duplicateBookingId,
        branchId,
        classSlotId: targetSlotIds[1],
        customerUserId: customerIds[1],
        customerPackageId: customerPackageIds[1],
        reservationId: duplicateReservationId,
        createdById: customerIds[1],
        source: 'SELF',
      },
    });
    await expect(
      service.decide(
        admin,
        reschedule.id,
        'approve',
        { reasonCode: 'ELIGIBILITY_VERIFIED', expectedVersion: reschedule.version },
        `${namespace}-duplicate-target`,
        `${namespace}-duplicate-target`,
      ),
    ).rejects.toThrow('DUPLICATE_ACTIVE_BOOKING');
    expect(
      (await db.reservasiSesi.findUnique({ where: { id: reservationIds[1] } }))?.classSlotId,
    ).toBe(sourceSlotIds[1]);
    await db.pemesananKelas.delete({ where: { id: duplicateBookingId } });
    await db.reservasiSesi.delete({ where: { id: duplicateReservationId } });
    await service.decide(
      admin,
      reschedule.id,
      'reject',
      { reasonCode: 'OUTSIDE_POLICY', expectedVersion: reschedule.version },
      `${namespace}-decision-1`,
      `${namespace}-decision-1`,
    );
    expect((await db.pemesananKelas.findUnique({ where: { id: bookingIds[1] } }))?.status).toBe('BOOKED');
    expect(
      (await db.reservasiSesi.findUnique({ where: { id: reservationIds[1] } }))?.classSlotId,
    ).toBe(sourceSlotIds[1]);
  });

  it('fails closed without required reschedule configuration', async () => {
    const gated = new ReschedulesService(
      db as never,
      new IdempotencyService(db as never),
      new PolicyService(),
      {
        value: {
          booking: { enabled: true, cutoffHours: 2 },
          reschedule: { enabled: false, cutoffHours: null },
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
  });
});
