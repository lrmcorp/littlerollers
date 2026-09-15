import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { AvailabilityService } from './ketersediaan-instruktur.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;

databaseDescribe('synthetic instructor availability MySQL integration', () => {
  const db = new PrismaClient();
  const service = new AvailabilityService(
    db as never,
    new PolicyService(),
    new IdempotencyService(db as never),
  );
  const namespace = `availability-${Date.now()}`;
  const instructorId = randomUUID();
  const branchId = randomUUID();
  const otherBranchId = randomUUID();
  const assignmentId = randomUUID();
  const otherAssignmentId = randomUUID();
  const principal = {
    sessionId: namespace,
    userId: instructorId,
    roles: [{ role: 'INSTRUCTOR' as const, branchId }],
    capabilities: ['availability:self:read', 'availability:self:create'],
    branchIds: [branchId, otherBranchId],
  };

  beforeAll(async () => {
    await db.$connect();
    await db.user.create({ data: { id: instructorId, displayName: 'Synthetic instructor' } });
    await db.cabang.createMany({
      data: [
        { id: branchId, code: `${namespace}-a`, name: 'Jakarta', timezone: 'Asia/Jakarta' },
        { id: otherBranchId, code: `${namespace}-b`, name: 'Bali', timezone: 'Asia/Makassar' },
      ],
    });
    await db.penugasan.createMany({
      data: [
        {
          id: assignmentId,
          userId: instructorId,
          branchId,
          type: 'INSTRUCTOR',
          activeFrom: new Date('2026-01-01'),
        },
        {
          id: otherAssignmentId,
          userId: instructorId,
          branchId: otherBranchId,
          type: 'INSTRUCTOR',
          activeFrom: new Date('2026-01-01'),
        },
      ],
    });
  });
  afterAll(async () => {
    const ids = (
      await db.ketersediaanInstruktur.findMany({
        where: { instructorUserId: instructorId },
        select: { id: true },
      })
    ).map(({ id }) => id);
    await db.auditLog.deleteMany({
      where: { objectType: 'InstructorAvailability', objectId: { in: ids } },
    });
    await db.ketersediaanInstruktur.deleteMany({ where: { instructorUserId: instructorId } });
    await db.idempotencyRecord.deleteMany({
      where: { scope: `instructor-availability:${instructorId}` },
    });
    await db.penugasan.deleteMany({ where: { id: { in: [assignmentId, otherAssignmentId] } } });
    await db.cabang.deleteMany({ where: { id: { in: [branchId, otherBranchId] } } });
    await db.user.delete({ where: { id: instructorId } });
    await db.$disconnect();
  });

  it('creates, replays and lists an authoritative UTC interval', async () => {
    const input = {
      branchId,
      startAt: '2026-08-01T09:00:00+07:00',
      endAt: '2026-08-01T11:00:00+07:00',
    };
    const first = await service.create(principal, input, `${namespace}-1-abcdefghijkl`, namespace);
    const replay = await service.create(principal, input, `${namespace}-1-abcdefghijkl`, namespace);
    expect(first.replay).toBe(false);
    expect(replay.replay).toBe(true);
    expect(
      await db.ketersediaanInstruktur.count({ where: { instructorUserId: instructorId } }),
    ).toBe(1);
    expect(
      await db.auditLog.count({ where: { objectType: 'InstructorAvailability' } }),
    ).toBeGreaterThanOrEqual(1);
    const page = await service.list(
      principal,
      branchId,
      '2026-08-01T00:00:00Z',
      '2026-08-02T00:00:00Z',
    );
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({ timezone: 'Asia/Jakarta' });
  });

  it('allows adjacency but rejects same and cross-branch overlap', async () => {
    await service.create(
      principal,
      { branchId, startAt: '2026-08-01T11:00:00+07:00', endAt: '2026-08-01T12:00:00+07:00' },
      `${namespace}-2-abcdefghijkl`,
      namespace,
    );
    await expect(
      service.create(
        principal,
        { branchId, startAt: '2026-08-01T10:00:00+07:00', endAt: '2026-08-01T10:30:00+07:00' },
        `${namespace}-3-abcdefghijkl`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'EFFECTIVE_PERIOD_OVERLAP' });
    await expect(
      service.create(
        principal,
        {
          branchId: otherBranchId,
          startAt: '2026-08-01T10:00:00+08:00',
          endAt: '2026-08-01T11:00:00+08:00',
        },
        `${namespace}-4-abcdefghijkl`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'EFFECTIVE_PERIOD_OVERLAP' });
  });

  it('allows only one concurrent overlap and rejects changed idempotency payload', async () => {
    const overlapping = [
      service.create(
        principal,
        { branchId, startAt: '2026-08-03T09:00:00+07:00', endAt: '2026-08-03T11:00:00+07:00' },
        `${namespace}-concurrent-a`,
        namespace,
      ),
      service.create(
        principal,
        { branchId, startAt: '2026-08-03T10:00:00+07:00', endAt: '2026-08-03T12:00:00+07:00' },
        `${namespace}-concurrent-b`,
        namespace,
      ),
    ];
    const results = await Promise.allSettled(overlapping);
    expect(results.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(({ status }) => status === 'rejected')).toHaveLength(1);
    const key = `${namespace}-changed-key`;
    await service.create(
      principal,
      { branchId, startAt: '2026-08-04T09:00:00+07:00', endAt: '2026-08-04T10:00:00+07:00' },
      key,
      namespace,
    );
    await expect(
      service.create(
        principal,
        { branchId, startAt: '2026-08-04T10:00:00+07:00', endAt: '2026-08-04T11:00:00+07:00' },
        key,
        namespace,
      ),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUSED');
  });

  it('rejects offset-less, reversed and hidden branch inputs', async () => {
    await expect(
      service.create(
        principal,
        { branchId, startAt: '2026-08-02T09:00:00', endAt: '2026-08-02T10:00:00Z' },
        `${namespace}-5-abcdefghijkl`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.create(
        principal,
        { branchId, startAt: '2026-08-02T11:00:00Z', endAt: '2026-08-02T10:00:00Z' },
        `${namespace}-6-abcdefghijkl`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(service.list({ ...principal, branchIds: [] }, branchId)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });
});
